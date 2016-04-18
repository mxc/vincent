/**
 * Created by mark on 2016/02/21.
 */

import Engine from '../base/Engine';
import fs from 'fs';
import yaml from 'js-yaml';
import Host from '../host/Host.js';
import logger from '../../Logger';
import child_process from 'child_process';
import Manager from '../base/Manager';
import HostManager from '../host/HostManager';
import path from 'path';


require("babel-polyfill");

class AnsibleEngine extends Engine {

    constructor(provider) {
        super();
        this.inventory = new Set();
        this.playbooks = {};//a  directory lookup cache for generated playbooks
        this.provider = provider;
        this.playbookDir = path.resolve(provider.getEngineDir(), "playbooks");
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
        return new Promise((resolve, reject)=> {
            this.mkPlayBookDir()
                .then((result)=> {
                    if (host instanceof Host) {
                        return this.writePlaybooks(host);
                    } else if (typeof host == 'string') {
                        let tmpHost = this.provider.managers.hostManager.findValidHost(host);
                        if (tmpHost) {
                            return this.writePlaybook(tmpHost);
                        } else {
                            logger.logAndThrow(`${host} not found in valid hosts`);
                        }
                    } else if (!host) {
                        return this.writePlaybooks();
                    } else {
                        logger.logAndThrow("Parameter must be of type Host or undefined");
                    }
                })
                .then((results)=> {
                    return this.writeInventory();
                })
                .then(file=> {
                    resolve("success");
                }, reject)
                .catch((e)=> {
                    logger.logAndThrow(e.message);
                });
        });
    }

    mkPlayBookDir() {
        let func = (resolve)=> {
            fs.stat(this.playbookDir, (err)=> {
                if (err) {
                    fs.mkdir(this.playbookDir, (err) => {
                        if (err) {
                            logger.logAndAddToErrors(`Error attempting to create playbook directory - {$err}`, this.errors);
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

    /*
     writePlaybooks takes a single object parameter with the following properties
     {
     host:<Host Object ,
     self: <AnsibleEngine Object>
     }
     If hosts is undefined then all hosts with playbooks have their playbooks generated else just the required host has
     its playbook generated.
     */
    writePlaybooks(host) {
        if (host && !host instanceof Host) {
            logger.logAndThrow("Host parameter must be of type Host");
        } else if (host) {
            return this.writePlaybook(host.name);
        } else {
            //else
            let promises = [];
            for (let hostname in this.playbooks) {
                promises.push(this.writePlaybook(hostname));
            }
            return Promise.all(promises).then(()=> {
                return host;
            });
        }
    }

    /*
     Write out the yml playbook file using javascript ansible object
     */
    writePlaybook(host) {
        let hostname = '';
        if (host instanceof Host) {
            hostname = host.name;
        } else if (typeof host !== 'string') {
            logger.logAndThrow("Host must be of type Host or a hostname string");
        } else {
            hostname = host;
        }
        return new Promise((resolve, reject)=> {
            try {
                fs.writeFile(this.playbookDir + `/${hostname}.yml`,
                    this.playbooks[hostname].yml,
                    (err)=> {
                        if (err) {
                            logger.logAndAddToErrors(`Error attempting to create playbook for ${hostname}`,
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
                        inventory += "\n\r";
                    } else {
                        cont = false;
                    }
                }
                var filename = this.playbookDir + `/inventory`;
                fs.writeFile(filename, inventory, (err)=> {
                    if (err) {
                        logger.logAndThrow("Error creating inventory file for ansible");
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
        if (!host || !host instanceof Host) {
            logger.logAndThrow("The host parameter must be defined and of type Host");
        }
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
        this.playbooks[host.name] = {};
        this.playbooks[host.name].yml = yaml.safeDump(playbook); //cache the generated yml for playbook.
        this.playbooks[host.name].object = playbook; //cache the generated object for playbook.
        return this.playbooks[host.name].yml;
    }

    /*
     Method to retrieve host details using ansible target properties
     */
    getInfo(host, checkhostkey, privkey, username, passwd, sudoPasswd) {
        if (host instanceof Host && host.name) {
            var hostname = host.name;
        } else if (typeof host == 'string') {
            hostname = host;
        } else {
            logger.logAndThrow("The host parameter must be of type Host or a host name string.");
        }

        let cmd = 'ansible';
        let args = this.getArgs(privkey, username, passwd);
        let opts = this.getOpts(checkhostkey);
        args.push("-m");
        args.push("setup");
        args.push(hostname);

        return new Promise((resolve, reject)=> {
                let proc = child_process.spawn(cmd, args, opts);
                proc.stdout.on('data', (data)=> {
                    if (!this.checkPasswordPrompt(proc, data, passwd, sudoPasswd)) {
                        //proc.kill();
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
            //stdio: 'inherit'
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

    /*
     Run an ansible playbook!
     */
    runPlaybook(host, checkhostkey, privkey, username, passwd, sudoPasswd) {
        if (host instanceof Host && host.name) {
            var hostname = host.name;
        } else if (typeof host == 'string') {
            hostname = host;
        } else {
            logger.logAndThrow("The host parameter must be of type Host or a host name string.");
        }

        let cmd = 'ansible-playbook';
        let args = this.getArgs(privkey, username, passwd);
        let opts = this.getOpts(checkhostkey);
        args.push(`${hostname}.yml`);
        //args.push('--extra-vars');

        return new Promise((resolve)=> {
            let proc = child_process.spawn(cmd, args, opts);

            proc.stdout.on('data', (data)=> {
                if (!this.checkPasswordPrompt(proc, data, passwd, sudoPasswd)) {
                    if (data.indexOf("PLAY RECAP") != -1) {
                        resolve(data.toString());
                    }
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