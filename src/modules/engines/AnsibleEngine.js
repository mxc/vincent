/**
 * Created by mark on 2016/02/21.
 */

import Engine from '../base/Engine';
import fs from 'fs';
import yaml from 'js-yaml';
import Host from '../host/Host.js';
import {logger} from '../../Logger';
import child_process from 'child_process';
import Manager from '../base/Manager';
import HostManager from '../host/HostManager';
import path from 'path';
import {EOL} from 'os';
import mkdirp from 'mkdirp';

class AnsibleEngine extends Engine {

    constructor(provider) {
        super(provider);
        this.inventory = new Set();
        this.playbooks = {};//a  directory lookup cache for generated playbooks
        this.provider = provider;
        this.playbookDir = path.resolve(provider.getEngineDir(), "playbooks");
        this.errors = [];
    }

    clean() {
        return new Promise((resolve, reject)=> {
            fs.stat(this.playbookDir, (err)=> {
                if (!err) {
                    fs.readdir(this.playbookDir, (err, files)=> {
                        if (err) {
                            logger.logAndThrow("Error attempting to list playbook directory");
                        } else {
                            resolve(files);
                        }
                    });
                } else {
                    reject("no files to delete");
                }
            });
        }).then(files=> {
            files.forEach(file=> {
                let fullpath = path.resolve(this.playbookDir, file);
                this.delete(fullpath);
            })
        }, result=> {
            logger.logAndThrow(result);
        });
    }

    delete(fullpath) {
        let stat = fs.statSync(fullpath);
        if (stat.isDirectory()) {
            fs.readdirSync(fullpath).forEach((file) => {
                var curPath = path.resolve(fullpath, file);
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.delete(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(fullpath);
        } else {
            fs.unlinkSync(fullpath);
        }
    }

    export(host) {
        if(!host instanceof Host){
            logger.logAndThrow("The parameter host must be an instance of Host.");
        }
        return new Promise((resolve, reject)=> {
            this.mkPlayBookDir(host.configGroup)
                .then((result)=> {
                    if (host) {
                        host = this.provider.managers.hostManager.findValidHost(host);
                        if (host) {
                            this.loadEngineDefinition(host);
                            return this.writePlaybook(host);
                        }else{
                            logger.logAndThrow(`Host ${host.name} of ${host.configGroup} is not a valid host.`);
                        }
                    }
                }).then((results)=> {
                    return this.writeInventory();
                })
                .then(file=> {
                    resolve("success");
                }, reject).catch((e)=> {
                logger.logAndThrow(e.message);
            });
        });
    }

    mkPlayBookDir(configGroup) {
        let func = (resolve)=> {
            let tpath = path.resolve(this.playbookDir,configGroup);
            fs.stat(tpath, (err)=> {
                if (err) {
                    mkdirp(tpath, (err) => {
                        if (err) {
                            logger.logAndAddToErrors(`Error attempting to create playbook directory ${tpath} - {$err}.`, this.errors);
                            throw err;
                        } else {
                            resolve("Created playbooks directory.");
                        }
                    });
                } else {
                    resolve("Playbooks directory found.");
                }
            });
        };
        return new Promise(func);
    }


    writePlaybooks() {
        let promises = [];
        for (let host in this.playbooks) {
            for (let configGroup in this.playbooks[host]) {
                let host = this.provider.managers.hostManager.findValidHost(hostname,configGroup);
                if (host) {
                    try {
                        promises.push(this.writePlaybook(host));
                    } catch (e) {
                        logger.info(`Skipping playbook creation for host ${hostname} due to inadequate permissions`);
                    }
                }else{
                    logger.logAndThrow(`Host ${host.name} of ${host.configGroup} is not a valid host.`);
                }
            }
        }
        return Promise.all(promises);
    }


    /*
     Write out the yml playbook file using javascript ansible object
     */
    writePlaybook(host) {
        if(!host instanceof Host){
            logger.logAndThrow("Parameter host must be an instance of Host.");
        }
        return new Promise((resolve, reject)=> {
            host = this.provider.managers.hostManager.findValidHost(host);
            if (!host){
                logger.logAndThrow(`Host ${host.name} of ${host.configGroup} is not a valid host.`);
            }
            let hostname = host.name;
            let configGroup = host.configGroup;
            try {
                let tpath = path.resolve(this.playbookDir,host.configGroup,`${hostname}.yml`);
                fs.writeFile(tpath, this.playbooks[hostname][configGroup].yml,
                    (err)=> {
                        if (err) {
                            logger.logAndAddToErrors(`Error attempting to create playbook for ${hostname} for ${configGroup}.`,
                                this.errors);
                            reject(err);
                        } else {
                            resolve(this);
                        }
                    });
            } catch (e) {
                logger.logAndAddToErrors(e.message, this.errors);
                throw e;
            }
        });
    }

    /*
     creates the inventory filed needed by ansible to run playbooks.
     */
    writeInventory() {
        return new Promise((resolve)=> {
            try {
                let inventory = "";
                let items = this.inventory.values();
                let cont = true;
                while (cont) {
                    let item = items.next();
                    if (!item.done) {
                        inventory += item.value;
                        inventory += EOL;
                    } else {
                        cont = false;
                    }
                }
                var filename = this.playbookDir + `/inventory`;
                fs.writeFile(filename, inventory, (err)=> {
                    if (err) {
                        logger.logAndThrow("Error creating inventory file for ansible.");
                    }
                    resolve(filename);
                });
            } catch (e) {
                logger.logAndAddToErrors(e.message, this.errors);
                throw e;
            }
        });
    }

    /*
     Create the ansible javascript object from vincent's javascript host object. The ansible object holds the properties and
     values as defined by ansible modules to be used to generate the yml file on export with writePlaybook().
     */
    loadEngineDefinition(host) {
        if (!host instanceof Host) {
            logger.logAndThrow("Parameter host must be an instance of Host.");
        }
        host = this.provider.managers.hostManager.findValidHost(host);
        this.inventory.add(host.name);
        //needs to be an array to generate correct yml for ansible
        var playbook = [];
        playbook.push({hosts: host.name, tasks: []});
        let tasks = playbook[0].tasks;

        for (let manager in this.provider.managers) {
            if (this.provider.managers[manager] instanceof Manager) {
                if (this.provider.managers[manager] instanceof HostManager) continue;
                this.provider.managers[manager].exportToEngine("ansible", host, tasks);
            }
        }
        if (!this.playbooks[host.name]) {
            this.playbooks[host.name] = {};
        }
        if(!this.playbooks[host.name][host.configGroup]){
            this.playbooks[host.name][host.configGroup]=[];
        }

        this.playbooks[host.name][host.configGroup].yml = yaml.safeDump(playbook); //cache the generated yml for playbook.
        //this.playbooks[host.name].object = playbook; //cache the generated object for playbook.
        return this.playbooks[host.name][host.configGroup].yml;
    }

    /*
     Method to retrieve host details using ansible target properties
     */
    getInfo(host, checkhostkey, privkey, username, passwd, sudoPasswd) {
        if (!host instanceof Host){
            logger.logAndThrow("Parameter host must be an instance of Host.");
        }
        return new Promise((resolve, reject)=> {
                host = this.provider.managers.hostManager.findValidHost(host);
                if(host.length!==1){
                    logger.logAndThrow(`Host ${host.name} of ${host.configGroup} is not a valid host.`);
                }
                let cmd = 'ansible';
                let args = this.getArgs(privkey, username, passwd);
                let opts = this.getOpts(checkhostkey);
                args.push("-m");
                args.push("setup");
                args.push(host.name);
                let proc = child_process.spawn(cmd, args, opts);
                proc.stdout.on('data', (data)=> {
                    if (!this.checkPasswordPrompt(proc, data, passwd, sudoPasswd)) {
                        resolve(data.toString());
                    }
                });
                proc.stderr.on('data', (stderr)=> {
                    //this happens when ansible can't suppress the echo to the terminal
                    //all we do is ingore it and proceed. Not great as it leads to the
                    //problem with a trailing error that needs to be ignored.
                    if (!this.checkPasswordPrompt(proc, stderr, passwd, sudoPasswd)) {
                        //hack for stderr -> empty error message generates incorrect response
                        //we ignore it
                        if (stderr.toString().length > 1) {
                            reject(stderr.toString());
                        }
                    }
                });
            }
        );
    }

    getOpts(checkhostkey) {
        let opts = {
            cwd: this.playbookDir,
            detached: true,
            shell: "/bin/bash"
        };

        //set the ssh control path - bug with $HOME variable in ansible
        opts.env = {
            ANSIBLE_SSH_CONTROL_PATH: "./%%h-%%p-%%r",
            ANSIBLE_LOG_PATH: path.resolve(this.playbookDir, "ansible.log")
        };

        //disable hostkey checking if required
        if (!checkhostkey) {
            opts.env.ANSIBLE_HOST_KEY_CHECKING = "False";
        }
        return opts;
    }


    getArgs(privkey, username, passwd) {
        let args = [];
        if (privkey && !username) {
            args.push("-i");
            args.push("inventory");
            args.push(`--private-key=${privkey}`);
        } else if (privkey && username) {
            args.push("-i");
            args.push("inventory");
            args.push(`--private-key=${privkey}`);
            args.push(`-u`);
            args.push(username);
        } else if (username && passwd) {
            args.push("-i");
            args.push("inventory");
            args.push(`--ask-become-pass`);
            args.push(`--ask-pass`);
            args.push(`-u ${username}`);
        } else {
            args.push("-i");
            args.push("inventory");
        }
        return args;
    }

    /**
     * Run an ansible playbook!
     *
     * @param host
     * @param checkhostkey
     * @param privkeyPath
     * @param username
     * @param passwd
     * @param sudoPasswd
     * @returns {Promise}
     */
    runPlaybook(host, checkhostkey, privkeyPath, username, passwd, sudoPasswd) {
        if(!host instanceof Host){
            logger.logAndThrow("Parameter host must be an instanceof Host.");
        }
        let cmd = 'ansible-playbook';
        let args = this.getArgs(privkeyPath, username, passwd);
        let opts = this.getOpts(checkhostkey);
        args.push(`${host.configGroup}/${host.name}.yml`);
        return new Promise((resolve)=> {
            host = this.provider.managers.hostManager.findValidHost(host);
            let proc = child_process.spawn(cmd, args, opts);
            let results = "";
            proc.on('exit', (code)=> {
                let msg={ host:host.name};
                msg.log=results;
                if (code != 0) {
                    msg.status ="failed";
                } else {
                    msg.status ="succeeded";
                }
                this.log(msg);
                resolve(results);
            });

            proc.stdout.on('data', (data)=> {
                if (!this.checkPasswordPrompt(proc, data, passwd, sudoPasswd)) {
                    results = results.concat(data.toString());
                }
            });

            proc.stderr.on('data', (data)=> {
                if (!this.checkPasswordPrompt(proc, data, passwd, sudoPasswd)) {
                    if (data.toString().length > 3) {
                        throw new Error(data.toString());
                    }
                }
            });
        });

    }

    checkPasswordPrompt(proc, data, userPasswd, sudoPasswd) {
        if (data.toString().indexOf("SSH password:") != -1) {
            proc.stdin.write(`${userPasswd}\n`);
            return true;
        } else if (data.toString().indexOf("SUDO password") != -1) {
            if (sudoPasswd) {
                proc.stdin.write(`${sudoPasswd}\n`);
            } else {
                proc.stdin.write(`${userPasswd}\n`);
            }
            return true;
        } else {
            return false;
        }
    }

}

export default AnsibleEngine;