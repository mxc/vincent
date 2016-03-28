"use strict";

import Provider from '../Provider';
import User from '../modules/user/User';
import Group from '../modules/group/Group';
import Host from '../modules/host/Host';
import HostUser from '../modules/user/HostUser';
import HostGroup from '../modules/group/HostGroup';
import logger from '../Logger';
import fs from 'fs';
import Loader from './Loader';

class FileDbLoader extends Loader {

    constructor(provider) {
        super(provider);
    }

    setGroupCategories(groupCategories) {
        //we need to lookup user categories in group categories so there is
        //a loading dependency order.
        if (!this.userCategories) {
            logger.logAndThrow("user categories must be set before loading group categories");
        }

        if (!groupCategories) {
            groupCategories = JSON.parse(fs.readFileSync(this.config.confdir + 'includes/group-categories.js'));
        }

        //parse category groups to load2 for members which reference a user category.
        for (var groupCategory in groupCategories) {
            groupCategories[groupCategory].forEach((group)=> {
                var parsedGroupMembers = [];
                group.members.forEach((member)=> {
                    if (this.userCategories[member]) {
                        var usernames = this.userCategories[member].map((user)=> {
                            return user.name;
                        });
                        parsedGroupMembers = parsedGroupMembers.concat(usernames);
                    } else {
                        parsedGroupMembers.push(member)
                    }
                });
                group.members = parsedGroupMembers;
            });
        }
        this.groupCategories = groupCategories;
    }

    //Load model from JSON files.
    //ToDo refactor into methods for importUser, importGroup etc
    importUsersGroupsHosts() {
        return new Promise((resolve, reject)=> {
            //reset errors array at beginning of validation
            this.errors.length = 0;
            let dbDir = this.provider.config.get('confdir') + '/db';
            try {
                //user configuration
                fs.readFile(dbDir + '/users.json', 'utf-8', (err, data)=> {
                    if (err) {
                        throw new Error(err);
                    }
                    try {
                        let users = JSON.parse(data);
                        this.loadUsers(users);
                    } catch (e) {
                        logger.logAndAddToErrors(`Error loading the users config - ${e.message}.`,
                            this.errors);
                        //if we can't load users we won't be able to load hosts so throw error
                        throw e;
                    }
                    ////group configuration
                    fs.readFile(dbDir + '/groups.json', 'utf-8', (err, data)=> {
                        if (err) {
                            throw new Error(err);
                        }
                        try {
                            let groups = JSON.parse(data);
                            this.loadGroups(groups);
                        } catch (e) {
                            logger.logAndAddToErrors(`Error loading groups config - ${e.message}.`, this.errors);
                            //if we can't load groups we probably won't be able to load hosts
                            throw e;
                        }
                        //hosts configuration
                        fs.readdir(dbDir + '/hosts', (err, hostConfigs)=> {
                            hostConfigs.forEach((config)=> {
                                let data = fs.readFileSync(dbDir + `/hosts/${config}`, 'utf-8');
                                try {
                                    let hosts = JSON.parse(data);
                                    this.loadHosts(hosts);
                                } catch (e) {
                                    logger.logAndAddToErrors(`Error loading host config - ${e.message}.`, this.errors);
                                }
                            });
                            if (this.errors.length > 0) {
                                reject("load completed with errors.");
                            } else {
                                resolve("success");
                            }
                        });
                    });
                });
                //let users = JSON.parse(fs.readFileSync(dbDir + '/users.json', 'utf-8'));
                //this.loadUsers(users);
            } catch (e) {
                logger.logAndThrow(`Error loading the users config - ${e.message}`, this.errors);
            }
        });
    }

    importUserCategories() {
        return new Promise((resolve, reject)=> {
            let configDir = this.provider.config.get('confdir');
            fs.readFile(configDir + '/db/includes/user-categories.json', (err, data)=> {
                if (data) {
                    let userCategoriesData = JSON.parse(data);
                    try {
                        this.loadUserCategories(userCategoriesData);
                        resolve("success");
                    } catch (e) {
                        logger.warn("Failed to load User Categories from file system.");
                        reject(e.message);
                    }
                } else if (err) reject(err);
            });
        });
    }

    importGroupCategories() {
        return new Promise((resolve, reject)=> {
            let configDir = this.provider.config.get('confdir');
            fs.readFile(configDir
                + '/db/includes/group-categories.json', (err, data)=> {
                let groupCategoriesData = JSON.parse(data);
                try {
                    this.loadGroupCategories(groupCategoriesData);
                    resolve("success");
                } catch (e) {
                    logger.warn("Failed to load Group Categories from file system.");
                    reject(e.message);
                }
            });
        });
    }

    importSshConfigs() {
        return new Promise((resolve, reject)=> {
            let configDir = this.provider.config.get('confdir');
            fs.readFile(configDir + '/db/includes/ssh-configs.json', (err, data)=> {
                let sshConfigsData = JSON.parse(data);
                try {
                    this.loadSshConfigs(sshConfigsData);
                    resolve("success");
                } catch (e) {
                    logger.warn("Failed to load SSH Configs from file system.");
                    reject(e.message);
                }
            });
        });
    }

    importSudoerEntries() {
        return new Promise((resolve, reject)=> {
            let configDir = this.provider.config.get('confdir');
            fs.readFile(configDir + '/db/includes/sudoer-entries.json', (err, data)=> {
                let sudoerEntriesData = JSON.parse(data);
                try {
                    this.loadSudoerEntries(sudoerEntriesData);
                    resolve("success");
                } catch (e) {
                    logger.warn("Failed to load Sudoer Entries from file system.");
                    reject(e.message);
                }
            });
        });
    }


}

export default FileDbLoader;
    
