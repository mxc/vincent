/**
 * Created by mark on 2016/02/13.
 */

import HostComponent from './../base/HostComponent';
import User from './../user/User';
import {logger} from './../../Logger';

class HostGroup extends HostComponent {

    constructor(provider, data) {
        super(provider,data);
        this.data.members= [];
        this.errors = [];
        if (data) {
            if (typeof data === "object") {
                //find the group from the list of parsed groups for host and
                //addValidGroup group to this definition. If the group data has a state
                //of absent it will override the state of the global group definition
                //note: all the values of the global group are copied. Only state may change.
                if (!data.group || !data.group.name) {
                    logger.logAndThrow("The data object for HostGroup must have a property \"group\".");
                } else {
                    var group = this.provider.managers.groupManager.findValidGroupByName(data.group.name);
                    if (group) {
                        this.data.group = group.clone();
                        if (data.group.state === "absent") {
                            this.data.group.state = "absent";
                        }
                    } else {
                        logger.logAndThrow(`The group ${data.group.name} does not exist in valid groups.`);
                    }
                }

                if (data.members) {
                    data.members.forEach((username)=> {
                        username = username.name ? username.name : username;
                        let user = this.provider.managers.userManager.findValidUserByName(username);
                        if (user) {
                            user = user.clone();
                            try {
                                this.addMember(user);
                            } catch (e) {
                                logger.logAndAddToErrors(`There was an error adding members to the group ${data.group.name}. ${e.message}`, this.errors);
                            }
                        } else {
                            logger.logAndAddToErrors(`There was an error adding member ${username} to the group ${data.group.name}. ` +
                                ` User is not valid.`, this.errors);
                        }
                    });
                }
            } else {
                logger.logAndThrow("The data parameter for HostGroup must be an data object or undefined.");
            }
        }
    }

    merge(group) {
        if (group.name !== this.name) {
            logger.logAndThrow(`Group ${group.name} does not match ${this.data.name}`);
        } else {
            if (!this.data.group.gid) {
                this.data.group.gid = group.gid;
            }
            group.members.forEach((user)=> {
                this.addMember(user);
            });
        }
        return this.data;
    }

    get members() {
        return this.data.members;
    }

    get state() {
        return this.data.group.state;
    }

    set state(state){
        if(state!=='present' && state!=='absent'){
            throw new Error(`HostGroup state can only be present or absent not ${state}.`);
        }
        this.data.group.data.state=state;
    }
    
    addMember(user) {
        let username ="";
        if(typeof user =="string"){
            username = user
        }else if (user instanceof User){
            username= user.name;
        }
        //user = this.provider.managers.userManager.findValidUser(username);
        if (username!="") {
            //UserManager should be in global object cache
            var validUser = this.provider.managers.userManager.findValidUser(username);
            if (validUser && validUser.state != "absent") {
                var t_user = this.data.members.find((muser) => {
                    if (muser.name == validUser.name) {
                        return muser;
                    }
                });
                if (t_user) {
                    logger.logAndAddToErrors(`${user.name} is already a member of group ${this.data.name}.`, this.errors);
                } else {
                    this.data.members.push(validUser.clone());
                }
            } else {
                logger.logAndThrow(`Cannot add member to group. Parameter user with name ${user.name} is not a valid user or user is absent.`);
            }
        } else {
            logger.logAndThrow("Parameter user is not of type User and a valid user or a valid user name.");
        }
    }

    removeMember(user) {
        if (user instanceof User){
            user = user.name
        }

        if(typeof user =='string'){
            var t_user = this.data.members.find((muser, index, array) => {
                if (muser.name == user) {
                    array.splice(index, 1);
                    return muser;
                }
            });
            if (!t_user) {
                logger.logAndAddToErrors(`${user.name? user.name: user} is not a member of group ${this.data.group.name}.`, this.errors);
            }
        } else {
            logger.logAndThrow("Parameter user is not of type User or a username string.");
        }
    }

    containsMember(user){
        user = this.provider.managers.userManager.findValidUser(user);
        return this.data.members.find((tUser)=>{
             if (user.name === tUser.name){
                 return tUser;
             }
        });
    }

    get group() {
        return this.data.group;
    }

    get members() {
        return this.data.members;
    }

    get name() {
        return this.data.group.name;
    }

    export() {
        var obj = {};
        obj.group = this.data.group.exportId();
        if (this.data.members.length > 0) {
            obj.members = [];
            this.data.members.forEach((member)=> {
                obj.members.push(member.name);
            });
        }
        super.export(obj);
        return obj;
    }

    clone() {
        return new HostGroup(this.provider, this.data);
    }

}

export default HostGroup;