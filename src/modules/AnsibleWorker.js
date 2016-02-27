/**
 * Created by mark on 2016/02/21.
 */

import Generator from '../coremodel/Worker';
import fs from 'fs';
import yaml from 'js-yaml';
import Host from '../coremodel/Host.js';
import logger from '../Logger';

class AnsibleWorker extends Generator {

    constructor(provider) {
        super();
        this.inventory = [];
        this.playbooks = {};
        this.provider = provider;
        this.playbookDir = provider.config.get('confdir') + "/playbooks";
        this.errors = [];
    }

    generate(hosts) {
        if (Array.isArray(hosts)) {
            hosts.forEach((host)=> {
                if (host instanceof Host) {
                    this.generateHost(host);
                }
            });
        }
    }

    export() {
        try {
            fs.statSync(this.playbookDir)
        } catch (e) {
            if (e.message.indexOf("Error: ENOENT: no such file or directory, stat")) {
                try {
                    fs.mkdir(this.playbookDir);
                } catch (e) {
                    logger.logAndThrow("Error attempting to create playbook directory");
                }
            }
        }
        for (let node  in this.playbooks) {
            try {
                fs.writeFileSync(this.playbookDir + `/${node}.yml`, this.playbooks[node]);
            } catch (e) {
                logger.logAndAddToErrors(`Error attempting to create playbook for ${node}`, this.errors);
            }
        }
        let inventory = this.inventory.join("/n/r");
        try {
            fs.writeFileSync(this.playbookDir + `/inventory`, inventory);
        } catch (e) {
            logger.logAndAddToErrors("Error creating inventory file for ansible", this.errors);
        }
        return this.errors.length > 0 ? false : true;
    }

    generateHost(host) {
        this.inventory.push(host.name);
        var playbook = [];
        playbook.push({hosts: host.name, tasks: []});
        //playbook.push({tasks: []});
        let tasks = playbook[0].tasks;
        host.users.forEach((user)=> {
            let ansibleUser = {
                name: "User account state check",
                user: `name=${user.name} state=${user.state}`,
                sudo: 'yes'
            };
            if (user.uid) {
                ansibleUser.user += ` uid={$user.uid}`;
            }
            tasks.push(ansibleUser);
            user.authorized_keys.forEach((authorizedUser)=> {
                let ansibleAuthorizedKey = {
                    name: "User authorized key state check",
                    authorized_key: {
                        user: `${user.name}`,
                        key: `{{ lookup('file','${authorizedUser.key}') }}`,
                        manage_dir: 'yes',
                        state: `${authorizedUser.state}`
                    },
                    sudo: 'yes'
                };
                tasks.push(ansibleAuthorizedKey);
            });
        });
        host.groups.forEach((group)=> {
            let ansibleGroup = {
                name: "Group state check",
                group: `name=${group.name} state=${group.state}`,
                sudo: 'yes'
            };
            if (group.gid) {
                ansibleGroup.group += ` gid={$group.gid}`;
            }
            tasks.push(ansibleGroup);
        });
        if (host.ssh) {
            tasks.push({
                name: "Ssh config PermitRoot state check",
                lineinfile: `dest=/etc/ssh/sshd_config
                   regexp='^PermitRootLogin yes|^PermitRootLogin no|^#PermitRootLogin yes'
                   line='PermitRootLogin ${host.ssh.permitRoot}`,
                sudo: 'yes'
            });
            tasks.push({
                name: "Ssh config PermitPassword state check",
                lineinfile: `dest=/etc/ssh/sshd_config
                   regexp='PasswordAuthentication yes|PasswordAuthentication no'
                   line='PasswordAuthentication ${host.ssh.passwordAuthentication}`,
                sudo: 'yes'
            });
            if (host.ssh.validUsersOnly) {
                let users = '';
                host.users.forEach((user, index)=> {
                    user += user.name;
                    if (index < host.users.length - 1) {
                        user += ",";
                    }
                });
                tasks.push({
                    name: "Ssh config ValidUsers state check",
                    lineinfile: `dest=/etc/ssh/sshd_config
                   regexp='AllowUsers .*|#AllowUsers'
                   line='AllowUsers ${users}`,
                    sudo: 'yes'
                });
            }
        }
        this.playbooks[host.name] = yaml.safeDump(playbook);
        return this.playbooks[host.name];
    }

    getInfo(host){
        if(host instanceof Host){
            let host = host.name;
            let proc = child_process_exec('ansible' ['-m setup',host]);
            proc.stdout.on('data',(data)=>{
                    console.log(data);
            });
            proc.stderr.on('data',(data)=>{
                    console.log(data);
            });
        }else if (typeof host != 'string'){
            logger.logAndThrow("The host parameter must be of type Host or a host name string.");
        }

    }
}


export default AnsibleWorker;