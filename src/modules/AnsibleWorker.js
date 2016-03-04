/**
 * Created by mark on 2016/02/21.
 */

import Worker from '../coremodel/Worker';
import fs from 'fs';
import yaml from 'js-yaml';
import Host from '../coremodel/Host.js';
import logger from '../Logger';
import child_process from 'child_process';
import events from 'events';

require("babel-polyfill");

class AnsibleWorker extends Worker {

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
                    this.loadEngineDefinition(host);
                }
            });
        }
    }

    export(host) {
        return new Promise((resolve, reject)=> {
            this.mkPlayBookDir()
                .then((resultObject)=> {
                    if (host instanceof Host) {
                        resultObject.host = host;
                        return this.writePlaybooks(resultObject);
                    } else {
                        return this.writePlaybooks(resultObject);
                    }
                })
                .then(this.writeInventory)
                .then(resolve, reject)
                .catch((e)=> {
                    console.log(e)
                });
        });
    }

    mkPlayBookDir() {
        let self = this;
        return new Promise((resolve)=> {
            fs.stat(this.playbookDir, (err)=> {
                if (err) {
                    fs.mkdir(this.playbookDir, (err) => {
                        if (err) {
                            logger.logAndThrow("Error attempting to create playbook directory");
                        } else {
                            resolve({
                                msg: "Created playbooks directory.",
                                self: self
                            });
                        }
                    });
                } else {
                    resolve({
                        msg: "Playbooks directory found.",
                        self: self
                    });
                }
            });
        });
    }

    writePlaybooks(resultObj) {
        try {
            if (resultObj.host) {
                return resultObj.self.writePlaybook({
                    playbook: resultObj.host.name,
                    self: resultObj.self
                });
            }
            //else
            let promises = [];
            for (let playbookTitle in resultObj.self.playbooks) {
                promises.push(resultObj.self.writePlaybook({
                    playbook: playbookTitle,
                    self: resultObj.self
                }));
            }
            return Promise.all(promises).then(()=> {
                return resultObj;
            });
        } catch (e) {
            console.log(e.message);
        }
    }

    writePlaybook(resultObj) {
        return new Promise((resolve, reject)=> {
            try {
                fs.writeFile(resultObj.self.playbookDir + `/${resultObj.playbook}.yml`,
                    resultObj.self.playbooks[resultObj.playbook],
                    (err)=> {
                        if (err) {
                            logger.logAndAddToErrors(`Error attempting to create playbook for ${playbook}`,
                                resultObj.self.errors);
                            reject(err);
                        } else {
                            resolve({self: resultObj.self});
                        }
                    });
            } catch (e) {
                console.log(e.message);
            }
        });
    }

    writeInventory(resultObj) {
        return new Promise((resolve, reject)=> {
            try {
                let inventory = resultObj.self.inventory.join("/n/r");
                fs.writeFile(resultObj.self.playbookDir + `/inventory`, inventory, (err)=> {
                    if (err) {
                        logger.logAndAddToErrors("Error creating inventory file for ansible",
                            resultObj.self.errors);
                        reject(err);
                    }
                    if (resultObj.self.errors.length > 0) {
                        reject(resultObj.self.errors);
                    } else {
                        resolve("success");
                    }
                });
            } catch (e) {
                console.log(e.message);
            }
        });
    }

    loadEngineDefinition(host) {
        this.inventory.push(host.name);
        var playbook = [];
        playbook.push({hosts: host.name, tasks: []});
        let tasks = playbook[0].tasks;
        if (host.users) {
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
                if (user.authorized_keys) {
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
                }
            });
        }
        if (host.groups) {
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
        }
        if (host.ssh) {
            tasks.push({
                name: "Ssh config PermitRoot state check",
                lineinfile: {
                    dest: '/etc/ssh/sshd_config',
                    regexp: '^PermitRootLogin yes|^PermitRootLogin no|^#PermitRootLogin yes',
                    line: `PermitRootLogin ${host.ssh.permitRoot}`
                },
                sudo: 'yes'
            });
            tasks.push({
                name: "Ssh config PermitPassword state check",
                lineinfile: {
                    dest: '/etc/ssh/sshd_config',
                    regexp: 'PasswordAuthentication yes|PasswordAuthentication no',
                    line: `PasswordAuthentication ${host.ssh.passwordAuthentication}`
                },
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
                    lineinfile: {
                        dest: '/etc/ssh/sshd_config',
                        regexp: 'AllowUsers .*|#AllowUsers',
                        line: `AllowUsers ${users}`
                    },
                    sudo: 'yes'
                });
            }
        }
        this.playbooks[host.name] = yaml.safeDump(playbook);
        return this.playbooks[host.name];
    }

    getInfo(host) {
        if (host instanceof Host && host.name) {
            var hostname = host.name;
        } else if (typeof host == 'string') {
            hostname = host;
        } else {
            logger.logAndThrow("The host parameter must be of type Host or a host name string.");
        }

        let proc = child_process.exec(`ansible -m setup -i inventory ${hostname}`,
            {cwd: this.playbookDir});
        let promise = new Promise(function (resolve, reject) {
            proc.stdout.on('data', (data)=> {
                resolve(data);
            });
            proc.stderr.on('data', (data)=> {
                reject(data);
            });
        });
        return promise;
    }

    runPlaybook(host, callback, userPasswd, sudoPasswd) {

        if (host instanceof Host && host.name) {
            var hostname = host.name;
        } else if (typeof host == 'string') {
            hostname = host;
        } else {
            logger.logAndThrow("The host parameter must be of type Host or a host name string.");
        }

        let opts = [`${hostname}.yml`];
        opts.push("-i");
        opts.push("inventory");

        if (userPasswd) {
            opts.push("--ask-pass");
        }

        if (sudoPasswd) {
            opts.push("--ask-become-pass");
        }

        opts.push('--extra-vars');
        opts.push(`"ansible_become_pass=dagama"`);

        let proc = child_process.spawn("ansible-playbook", opts,
            {cwd: this.playbookDir, detached: true});

        proc.stdout.on('data', (data)=> {
            if (data.toString().indexOf("SSH password:") != -1) {
                proc.stdin.write(`${userPasswd}\n`);
            } else if (data.toString().indexOf("SUDO password") != -1) {
                proc.stdin.write(`${sudoPasswd}\n`);
            } else {
                if (data.indexOf("PLAY RECAP")!=-1){
                    callback(data.toString());
                }
            }
        });


        proc.stderr.on('data', (data)=> {
            if (data) {
                if (data.toString().indexOf("SSH password:") != -1) {
                    proc.stdin.write(`${userPasswd}\n`);
                } else if (data.toString().indexOf("SUDO password") != -1) {
                    proc.stdin.write(`${sudoPasswd}\n`);
                }
            }
        });

    }

}

export default AnsibleWorker;