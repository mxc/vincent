"use strict";

import fs from 'fs';

class Base {

    constructor(users,groups, hosts){
        
    this.groups = groups;
            this.users = users;
            this.hosts = hosts;
            this.errors = [];
            this.parsedGroups = [];
            this.parsedUsers = [];
            this.parsedHosts = [];
    }
    
    setSSHConfigs(sshConfigs){
        if (!sshConfigs){
            sshConfigs = JSON.parse(fs.readFileSync(this.config.confdir+'includes/ssh-configs.js'));
        }
        this.sshConfigs=sshConfigs;
    }

    setUserCategories(userCategories){
        if (!userCategories){
            userCategories = JSON.parse(fs.readFileSync(this.config.confdir+'includes/user-categories.js'));
        }
        this.userCategories=userCategories;
    }

    setGroupCategories(groupCategories){
        //we need to lookup user categories in group categories so there is
        //a loading dependency order.
        if (!this.userCategories){
            throw new Error("user categories must be set before loading group categories");
        }
        
        if (!groupCategories){
            groupCategories = JSON.parse(fs.readFileSync(this.config.confdir+'includes/group-categories.js'));
        }
        
        //parse category groups to update for members which reference a user category.
        for (var groupCategory in groupCategories){
            groupCategories[groupCategory].forEach((group)=>{
              var parsedGroupMembers=[];
              group.members.forEach((member)=>{
                if (this.userCategories[member]){
                     var usernames = this.userCategories[member].map((user)=>{
                            return user.name;
                     });
                     parsedGroupMembers = parsedGroupMembers.concat(usernames);
                }else{
                    parsedGroupMembers.push(member)
                }
           });
            group.members = parsedGroupMembers;
        });
        }
        this.groupCategories=groupCategories;
    }
    
    //Check that the model is consistent.
    validateModel(){
        //reset errors array at beginning of validation
        this.errors.length = 0;
        
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
            
            //replace any ssh includes with config 
            if (host.include_ssh_config) {
                this.includeSSHConfig(host);
            }
            
            //Merge user categories into the user array
            if (host.include_user_categories){
               host.include_user_categories.forEach((userCategory) =>{ 
                    var categoryUsers = this.userCategories[userCategory];
                    categoryUsers.forEach((user)=>{
                        host.users.push(user);
                    });
                });
                delete host["include_user_categories"];
            }
            
            //user validation
            var processedUsers = [];
            host.users = host.users.filter((user, uindex, uarray) => {
                //check if current user has been defined
                var foundValidUser = this.findValidUser(user.name, validUsers);
                if (!foundValidUser){
                        this.errors.push(`User ${user.name} for ${host.name} is not defined in the user config file.`);
                        return false;
                }
                //to do merge duplicate users?
                //check for duplicate users - usually the result of an include_user_categories entry
                if (processedUsers.indexOf(user.name)!=-1){
                    return false;
                }else{
                    processedUsers.push(user.name);
                }
                    
                //set the user state from global user settings. Global state wins over local
                //state unless local state is "absent"
                if (!user.state ||  user.state ==="present"){
                    user.state = foundValidUser.state;
                }

                //check if the users allowed to login as the current user exist
                //and check that the user state is not "absent"
                //if not remove non-existing user from authorized_keys list
                if (user.state==="present" && user.authorized_keys){
                    user.authorized_keys = user.authorized_keys.filter((key, kindex, karray) => {
                        var authUser = this.findValidUser(key, validUsers);
                                //has the authorized_key user been defined
                                if (!authUser){
                                this.errors.push(`The authorized user ${key} for ${user.name} for ${host.name} has not been defined.`);
                                return false;
                        }
                        //does the defined authorized_key user have a public key
                        //and is the user "present"
                        if (authUser && (!authUser.key || authUser.state==="absent")){
                                this.errors.push(`The authorized user ${key} for ${user.name} for ${host.name} does not have a key defined.`);
                                return false;
                        }
                        return true;
                        });
                }else{
                    delete user["authorized_keys"];
                }
                return true;
            });
            
            //Merge group categories into the user array
            if (host.include_group_categories){
               host.include_group_categories.forEach((groupcategory) =>{ 
                    var categoryGroups = this.groupCategories[groupcategory];
                    if (categoryGroups){
                        categoryGroups.forEach((group)=>{
                            host.groups.push(group);
                    });
                    }else{
                       this.errors.push(`The group category ${groupcategory}  for host ${host} is not defined`);
                    }
                });
                delete host["include_group_categories"];
            }

            //group and group membership validation
            var tmpParsedGroups =[]; //used to detect duplicate groups resulting from included group_categories
            host.groups = host.groups.filter((group, gindex, garray) => {
                //has the group been defined
                if (!this.findValidGroup(group.name, validGroups)){
                        this.errors.push(`The group ${group.name} for host ${host.name} has not been defined.`);
                        return false;
                } else{
                    //have group members been defined
                    group.members = group.members.filter((member, mindex, marray) => {
                        var foundValidUser = this.findValidUser(member,host.users);
                        if (!foundValidUser){
                                this.errors.push(`The member ${member} of group ${group.name} for host ${host.name} has not been defined.`);
                                return false;
                        }
                        //has the user been marked as absent?
                        else if (foundValidUser.state==="absent"){
                            return false;
                        }else{
                            return true;
                        }
                    });
                    //check if group has already been processed. i.e is this a
                    //duplicate. If so add memebrs to existing group.
                    if (tmpParsedGroups.find((sgroup,index)=>{
                        if (sgroup.name==group.name){
                            var tmpGroup = tmpParsedGroups[index];
                            tmpGroup.members=tmpGroup.members.concat(group.members); 
                            return true;
                        }else{
                            return false;
                        }
                    })){
                         return false;
                    }else{
                        tmpParsedGroups.push(group);
                        return true;
                    }
            }
        });
         return true;
        });
    };
    
    includeSSHConfig(host){
        var sshConfig = Object.assign({},this.sshConfigs[host.include_ssh_config]);
        delete host["include_ssh_config"];
        host["ssh"] = sshConfig;
    }

    findValidUser(username, validUsers){
        if (Array.isArray(validUsers)){
                return validUsers.find((item) => {
                if (item.name === username){
                   return item;
                    }
                });
        }else{
            this.errors.push(`failed to search for user ${username} - provided validUsers was not defined`);
        }
    }

    findValidGroup(groupname, validGroups){
      if(Array.isArray(validGroups)){  
            return validGroups.find((item) => {
                if (item.name === groupname){
                    return item;
                }
            });
        }else{
            this.errors.push(`failed to search for group  ${groupname} - provided validGroups was not defined`);
        }
    }

}

export default Base;
    
