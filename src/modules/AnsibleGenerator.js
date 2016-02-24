/**
 * Created by mark on 2016/02/21.
 */

import Generator from '../coremodel/Generator';
import fs from 'fs';
import yaml from 'js-yaml';

class AnsibleGenerator extends Generator {

    generate(host) {
        var playbook = [];
        playbook.push({hosts: host.name, tasks:[]});
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
                        user:`${user.name}`,
                        key:`{{ lookup('file',${authorizedUser.key}) }}`,
                        manage_dir:'yes',
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
            if (host.ssh.validUsersOnly){
                let users='';
                host.users.forEach((user,index)=>{
                    user+=user.name;
                    if(index<host.users.length-1){
                        user+=",";
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
        console.log(yaml.safeDump(playbook));
    }

}

export default AnsibleGenerator;