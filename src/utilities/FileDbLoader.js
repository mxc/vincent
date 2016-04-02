"use strict";

import logger from '../Logger';
import fs from 'fs';
import Loader from './Loader';

class FileDbLoader extends Loader {

    constructor(provider) {
        super(provider);
    }

    // setGroupCategories(groupCategories) {
    //     //we need to lookup user categories in group categories so there is
    //     //a loading dependency order.
    //     if (!this.userCategories) {
    //         logger.logAndThrow("user categories must be set before loading group categories");
    //     }
    //
    //     if (!groupCategories) {
    //         groupCategories = JSON.parse(fs.readFileSync(this.config.confdir + 'includes/group-categories.js'));
    //     }
    //
    //     //parse category groups to loadFromJson for members which reference a user category.
    //     for (var groupCategory in groupCategories) {
    //         groupCategories[groupCategory].forEach((group)=> {
    //             var parsedGroupMembers = [];
    //             group.members.forEach((member)=> {
    //                 if (this.userCategories[member]) {
    //                     var usernames = this.userCategories[member].map((user)=> {
    //                         return user.name;
    //                     });
    //                     parsedGroupMembers = parsedGroupMembers.concat(usernames);
    //                 } else {
    //                     parsedGroupMembers.push(member)
    //                 }
    //             });
    //             group.members = parsedGroupMembers;
    //         });
    //     }
    //     this.groupCategories = groupCategories;
    // }

    //Load model from JSON files.
    //ToDo refactor into methods for importUser, importGroup etc
    importUsersGroupsHosts() {
        return new Promise((resolve, reject)=> {
            //reset errors array at beginning of validation
            this.errors.length = 0;
            let dbDir = this.provider.config.get('confdir') + '/db';
            try {
                    //hosts configuration
                    fs.readdir(dbDir + '/hosts', (err, hostConfigs)=> {
                        hostConfigs.forEach((config)=> {
                            let data = fs.readFileSync(dbDir + `/hosts/${config}`, 'utf-8');
                            try {
                                let hosts = JSON.parse(data);
                                this.provider.managers.hostManager.loadHosts(hosts);
                            } catch (e) {
                                logger.logAndAddToErrors(`Error loading host config - ${e.message}.`, this.errors);
                                //reject(e);
                            }
                        });
                        if (this.errors.length > 0) {
                            reject("loadFromJson completed with errors.");
                        } else {
                            resolve("success");
                        }
                    });
            } catch (e) {
                logger.logAndThrow(`Error loading the users config - ${e.message}`, this.errors);
            }
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
                    logger.warn("Failed to loadFromJson Sudoer Entries from file system.");
                    reject(e.message);
                }
            });
        });
    }


}

export default FileDbLoader;
    
