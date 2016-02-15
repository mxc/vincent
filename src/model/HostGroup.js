/**
 * Created by mark on 2016/02/13.
 */

import Provider from './Provider';
import Group from './Group';
import User from './User';
import logger from './Logger';

class HostGroup {

    constructor(provider,data) {
        if (!provider || !provider instanceof Provider){
                throw new Error("Parameter provider must be provided for HostGroup.")
        }
        this.provider = provider;
        this.data = { members: []};
        this.errors = [];
        if (data) {
            if (typeof data === "object") {
                //find the group from the list of parsed groups for host and
                //add group to this definition. If the group data has a state
                //of absent it will override the state of the global group definition
                //note: all the values of the global group are copied. Only state may change.
                if (!data.group || !data.group.name) {
                    logger.logAndThrow("The data object for HostGroupDef must have a property \"group\".");
                } else {
                    var group = provider.groups.findGroupByName(data.group.name);
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
                        var user = this.provider.users.findUserByName(username);
                        try {
                            this.addMember(user);
                        } catch (e) {
                            logger.logAndAddToErrors(`There was an error adding members to the group ${data.group.name}. ${e.message}`,this.errors);
                        }
                    });
                }
            } else {
                logger.logAndThrow("The data parameter for GroupUserDef must be an data object or undefined.");
            }
        }
    }

    merge(group) {
        if (group.name !== this.data.group.name) {
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

    addMember(user) {
        if (user instanceof User) {
            //Users should be in global object Coach
            var validUser = this.provider.users.findUser(user);
            if (validUser && validUser.state != "absent") {
                var t_user = this.data.members.find((muser) => {
                    return muser.equals(validUser);
                });
                if (t_user) {
                    logger.logAndAddToErrors(`${user.name} is already a member of group ${this.data.name}`, this.errors);
                } else if (!validUser.key) {
                    logger.logAndThrow(`${user.name} does not have a public key`);
                } else {
                    this.data.members.push(validUser.clone());
                }
                return this;
            } else {
                logger.logAndThrow(`Cannot add member to group. Parameter user with name ${user.name} is not a valid user or user is absent.`);
            }
        } else {
            logger.logAndThrow("Parameter user is not of type User");
        }
    }

    get group(){
        return this.data.group;
    }

    get members(){
        return this.data.members;
    }

    toJSON() {
        var str = '{"group":' + this.data.group.toJSON() + ",";
        str += ' "members":[';
        this.data.members.forEach((member,index)=> {
            str += member.toJSON();
            if(index!==this.data.members.length-1){
                str+= ",";
            }
        });
        str += ']}'
        return str;
    }

}

export default HostGroup;