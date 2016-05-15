/**
 * Created by mark on 2016/02/13.
 */

import HostComponent from './../base/HostComponent';
import User from './../user/User';
import logger from './../../Logger';

class HostGroup extends HostComponent {

    constructor(provider, data) {
        super(provider);
        this.data = {members: []};
        this.data.source = data;
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
                        let user = this.provider.managers.userManager.findValidUserByName(username);
                        if (user) {
                            try {
                                this.addMember(user);
                            } catch (e) {
                                logger.logAndAddToErrors(`There was an error adding members to the group ${data.group.name}. ${e.message}`, this.errors);
                            }
                        } else {
                            //is this a user category? If so addValidGroup all members from the category
                            let userCat = this.provider.managers.userCategories.findUserCategory(username);
                            if (userCat) {
                                userCat.userAccounts.forEach((tuser)=> {
                                    let user = this.provider.managers.userManager.findValidUserByName(tuser.user.name);
                                    try {
                                        this.addMember(user);
                                    } catch (e) {
                                        logger.logAndAddToErrors(`There was an error adding members to the group ${data.group.name}. ${e.message}`, this.errors);
                                    }
                                });
                            } else {
                                logger.logAndAddToErrors(`There was an error adding member ${username} to the group ${data.group.name}. ` +
                                    ` User is not valid.`, this.errors);
                            }
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

    addMember(user) {
        if (user instanceof User) {
            //UserManager should be in global object cache
            var validUser = this.provider.managers.userManager.findValidUser(user);
            if (validUser && validUser.state != "absent") {
                var t_user = this.data.members.find((muser) => {
                    if (muser.equals(validUser)) {
                        return muser;
                    }
                });
                if (t_user) {
                    logger.logAndAddToErrors(`${user.name} is already a member of group ${this.data.name}`, this.errors);
                } else {
                    this.data.members.push(validUser.clone());
                };
            } else {
                logger.logAndThrow(`Cannot add member to group. Parameter user with name ${user.name} is not a valid user or user is absent.`);
            }
        } else {
            logger.logAndThrow("Parameter user is not of type User");
        }
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
        return obj;
    }

}

export default HostGroup;