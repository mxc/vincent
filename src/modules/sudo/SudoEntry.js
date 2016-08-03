/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import Base from '../base/Base';
import UserAccount from '../user/UserAccount';
import User from '../user/User';
import HostGroup from './../group/HostGroup';
import Group from './../group/Group';
import _ from 'lodash';

class SudoEntry  {

    constructor(provider, data) {
        this.data = {
            userList: {
                users: [],
                groups: []
            }
        };
        this.provider = provider;
        if (typeof data == 'object') {
            this.data.name = data.name;
            if (Array.isArray(data.userList)) {
                data.userList.forEach((member)=> {
                    if (member.user) {
                        let user = this.provider.managers.userManager.findValidUserByName(member.user.name);
                        if (user) {
                            this.data.userList.users.push(user.clone());
                        }
                    } else if (member.group) {
                        let group = this.provider.managers.groupManager.findValidGroupByName(member.group.name);
                        if (group) {
                            this.data.userList.groups.push(group);
                        }
                    }
                });
            } else {
                throw new Error("A SudoEntry must have a userList property of type array.")
            }
            if (data.commandSpec) {
                this.data.commandSpec = data.commandSpec;
            } else {
                throw new Error("A SudoEntry must have a commandSpec property.")
            }
        } else {
            throw new Error("A SudoEntry constructor must have a SudoEntry object as a parameter.");
        }
    }

    addGroup(group) {
        let vGroup;
        if(typeof group =="string"){
            vGroup = this.provider.managers.groupManager.findValidGroupByName(group);
        }else if (group instanceof Group) {
            vGroup = this.provider.managers.groupManager.findValidGroup(group);
        } else if (group instanceof HostGroup) {
            vGroup = this.provider.managers.groupManager.findValidGroup(group.group);
        }
        if (vGroup) {
            if (!this.data.userList.groups.find((tgroup)=> {
                    if (tgroup.name === group.name) {
                        return tgroup;
                    }
                })) {
                this.data.userList.groups.push(vGroup);
            }
        } else {
            throw new Error("Parameter group must be of type Group or HostGroup.")
        }
    }

    get name(){
        return this.data.name;
    }

    get userList() {
        return _.clone(this.data.userList);
    }

    get commandSpec() {
        return this.data.commandSpec;
    }

    addUser(user) {
        let vUser;
        if(typeof user ==='string'){
            vUser = this.provider.managers.userManager.findValidUser(user);
        }else if (user instanceof User) {
            vUser = this.provider.managers.userManager.findValidUser(user);
        } else if (user instanceof UserAccount) {
            vUser = this.provider.managers.userManager.findValidUser(user.user);
        }
        if (vUser) {
            if (!this.data.userList.users.find((tuser)=> {
                    if (tuser.name === user.name) {
                        return tuser;
                    }
                })) {
                this.data.userList.users.push(user);
            }
        } else {
            throw new Error("Parameter user must be of type User or UserAccount.")
        }
    }

    removeUserGroup(elm) {
        if (elm instanceof Group && this.data.userList.groups) {
                this.data.userList.groups.forEach((group, index, array)=> {
                    if (group.name == elm.name) {
                        array.splice(index, 1);
                    }
                });
        } else if (elm instanceof User && this.data.userList.users) {
            this.data.userList.users.forEach((user, index, array)=> {
                if (user.name == elm.name) {
                    array.splice(index, 1);
                }
            });
        } else if(!(elm instanceof Group) && !(elm instanceof User)) {
            throw new Error("Parameter elm must be of type User or Group.")
        }
    }

    set commandSpec(cmdSpec) {
        this.data.commandSpec = cmdSpec;
    }

    export() {
        let obj={};
        obj.name = this.data.name;
        obj.userList=[];
        this.data.userList.users.forEach((user)=>{
            obj.userList.push({
                user:{
                    name: user.name
                }
            });
        });
        this.data.userList.groups.forEach((group)=>{
            obj.userList.push({
                group:{
                    name: group.name
                }
            });
        });
        obj.commandSpec = this.data.commandSpec;
        return obj;
    }

    get line() {
        let entry = '';
        let num = this.data.userList.users.length;
        this.data.userList.users.forEach((user, index)=> {
            entry += user.name;
            if (index < num - 1) {
                entry += ",";
            }
        });
        if (num>0 && this.data.userList.groups.length>0){
            entry +=",";
        }
        num = this.data.userList.groups.length;
        this.data.userList.groups.forEach((group, index)=> {
            entry += `%${group.name}`;
            if (index < num - 1) {
                entry += ",";
            }
        });

        entry += ` ALL = (${this.data.commandSpec.runAs})`;
        entry += ` ${this.data.commandSpec.options} `;
        num = this.data.commandSpec.cmdList.length;
        this.data.commandSpec.cmdList.forEach((cmd, index)=> {
            entry += cmd;
            if (index < num - 1) {
                entry += ",";
            }
        });
        return entry;
    }

    containsUser(user){
        user = this.provider.managers.userManager.findValidUser(user);
        return this.data.userList.users.find((tUser)=>{
           if(tUser.name==user.name){
               return tUser;
           }
        });
    }

    containsGroup(group){
        group = this.provider.managers.groupManager.findValidGroup(group);
       return this.data.userList.groups.find((tGroup)=>{
            if(tGroup.name==group.name){
                return tGroup;
            }
        });
    }

}

export default SudoEntry;