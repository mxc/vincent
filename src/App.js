"use strict";
import fs from 'fs';
class App {

    constructor(groups, users, hosts){
    this.groups = groups;
            this.users = users;
            this.hosts = hosts;
            this.errors = [];
            this.parsedGroups = [];
            this.parsedUsers = [];
            this.parsedHosts = [];
    }

    //Check that the model is consistent.
    validateModel(){
        //basic user configuration validation
        this.parsedUsers = validateUsers();
                //basic group configuration validation
                this.parsedGroups = validateGroups();
                //basic host configuration validation
                this.parsedHosts = validateHosts(parsedUsers, parsedGroups);
                if (this.errors.length > 0){
        return false;
        } else{
        return true;
        }
    }

    validateGroups(){
        var groupnames = new Set();
        var gids = new Set();
        return this.groups.filter((elm, index, array) => {
            if (!elm.name){
            this.errors.push(`Group with index ${index} is missing a name property.`);
                    return false;
            }
            if (!groupnames.has(elm.name)){
            groupnames.add(elm.name);
            } else{
            this.errors.push(`Group ${elm.name} has already been defined.`);
                    return false;
            };
                    if (elm.gid){
            if (!gids.has(elm.gid)){
            gids.add(elm.gid);
            } else{
            this.errors.push(`Gid ${elm.gid} for ${elm.name} has already been assigned.`);
                    return false;
            }
            }
            return true;
        });
    }

    validateUsers(){

        var usernames = new Set();
        var uids = new Set();
        return this.users.filter((elm, index, array) => {
        if (!elm.name){
                this.errors.push(`User with index ${index} is missing a name property.`);
                return false;
        }
        if (!usernames.has(elm.name)){
            if (elm.state != "present" && elm.state != "absent"){
                    this.errors.push(`User ${elm.name} has an invalid state.Must be 'present' or 'absent'.`);
                    return false;
        } else{
            usernames.add(elm.name);
        }
        } else{
                this.errors.push(`User ${elm.name} has already been defined.`);
                return false;
        };
        if (elm.name && elm.uid){
            if (!uids.has(elm.uid)){
                     uids.add(elm.uid);
            } else{
                    this.errors.push(`Uid ${elm.uid} from ${elm.name} has already been assigned.`);
                    return false;
            }
        }
        return true;
        });
    }

    validateHosts(validUsers, validGroups){
    //first clone the hosts array
    var clonedHosts = [];
            this.hosts.forEach((host) => {
            var clonedHost = {};
                    Object.assign(clonedHost, host);
                    clonedHosts.push(clonedHost);
            });
            //filter and clean up cloned hosts 
            return clonedHosts.filter((host, hindex, harray) => {
            //if the host is missing a name remove from results.
            if (!host.name){
                    this.errors.push(`Host with index ${hindex} is missing a name property.`);
                    return false;
            }

            //user validation
            host.users = host.users.filter((user, uindex, uarray) => {
                //check if current user has been defined
                if (!this.findValidUser(user.name, validUsers)){
                        this.errors.push(`User ${user.name} for ${host.name} is not defined in the user config file.`);
                        return false
                }
                //check if the users allowed to login as the current user exist
                //if not remove non-existing user from authorized_keys list
                user.authorized_keys = user.authorized_keys.filter((key, kindex, karray) => {
                    var userObj = this.findValidUser(key, validUsers);
                            //has the authorized_key user been defined
                            if (!userObj){
                            this.errors.push(`The authorized user ${key} for ${user.name} for ${host.name} has not been defined.`);
                            return false;
                    }
                    //does the defined authorized_key user have a public key
                    if (userObj && !userObj.key){
                            this.errors.push(`The authorized user ${key} for ${user.name} for ${host.name} does not have a key defined.`);
                            return false;
                    }
                    return true;
                    });
                return true;
            });

            //group and group membership validation
            host.groups = host.groups.filter((group, gindex, garray) => {
                //has the group been defined
                if (!this.findValidGroup(group.name, validGroups)){
                        this.errors.push(`The group ${group.name} for host ${host.name} has not been defined.`);
                        return false;
                } else{
                //have group members been defined
                    group.members = group.members.filter((member, mindex, marray) => {
                        if (!this.findValidUser(member,host.users)){
                                this.errors.push(`The member ${member} of group ${group.name} for host ${host.name} has not been defined.`);
                                return false;
                        }else{
                            return true;
                        }
                    });
                    return true;
            }
        });
         return true;
        });
    };

    findValidUser(username, validUsers){
        return validUsers.find((item) => {
        if (item.name === username){
           return item;
            }
        });
    }

    findValidGroup(groupname, validGroups){
        return validGroups.find((item) => {
            if (item.name === groupname){
                return item;
            }
        });
    }

}

export default App;
    
