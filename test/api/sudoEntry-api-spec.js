/**
 * Created by mark on 2016/05/29.
 */
"use strict";

import Provider from './../../src/Provider';
import {expect} from 'chai';
import UserAccount from '../../src/modules/user/UserAccount';
import Host from '../../src/modules/host/Host';
import User from '../../src/modules/user/User';
import Group from '../../src/modules/group/Group';
import SudoEntry from '../../src/modules/sudo/SudoEntry';
import HostGroup from '../../src/modules/group/HostGroup';


describe("SudoeEntry API should", function () {

    let provider = new Provider();

        it("allow for the creation of a SudoEntry object with a defined data structure",()=>{
                let data = {
                    name: "reboot",
                    userList:[
                        {
                            user:{
                                name: "user1"
                            }
                        },
                        {
                            group:{
                                name:"group1"
                            }
                        }
                    ],
                    commandSpec: {
                        "cmdList": [
                            "/bin/vi"
                        ],
                        "runAs": "ALL:ALL",
                        "options": "NOPASSWD:"
                    }
                };
                provider.managers.userManager.addValidUser(new User("user1"));
                provider.managers.groupManager.addValidGroup(new Group("group1"));
                let se = new SudoEntry(provider,data);
                expect(se.userList.users.length).to.equal(1);
                expect(se.userList.groups.length).to.equal(1);
            provider.managers.userManager.clear();
            provider.managers.groupManager.clear();
        });

    it("not allow users or groups in the userlist which are not valid",()=>{
        let data = {
            name: "reboot",
            userList:[
                {
                    user:{
                        name: "user1"
                    }
                },
                {
                    group:{
                        name:"group1"
                    }
                }
            ],
            commandSpec: {
                "cmdList": [
                    "/bin/vi"
                ],
                "runAs": "ALL:ALL",
                "options": "NOPASSWD:"
            }
        };
        let se = new SudoEntry(provider,data);
        //if user is not in valid users then user is not loaded to sudoEntry
        expect(se.userList.users.length).to.equal(0);
        //if group is not in valid groups then group is not loaded to sudoEntry
        expect(se.userList.groups.length).to.equal(0);
    });

    it("allow for the addition of users and groups after construction",()=>{
        let data = {
            name: "reboot",
            userList:[
                {
                    user:{
                        name: "user1"
                    }
                },
                {
                    group:{
                        name:"group1"
                    }
                }
            ],
            commandSpec: {
                "cmdList": [
                    "/bin/vi"
                ],
                "runAs": "ALL:ALL",
                "options": "NOPASSWD:"
            }
        };
        provider.managers.userManager.addValidUser(new User("user1"));
        provider.managers.userManager.addValidUser(new User("user2"));
        provider.managers.groupManager.addValidGroup(new Group("group1"));
        provider.managers.groupManager.addValidGroup(new Group("group2"));
        let se = new SudoEntry(provider,data);
        expect(se.userList.users.length).to.equal(1);
        expect(se.userList.groups.length).to.equal(1);
        se.addUser("user2");
        se.addGroup("group2")
        expect(se.userList.users.length).to.equal(2);
        expect(se.userList.groups.length).to.equal(2);
        provider.managers.userManager.clear();
        provider.managers.groupManager.clear();
    });

    it("not allow users or groups to be removed after construction",()=>{
        let data = {
            name: "reboot",
            userList:[
                {
                    user:{
                        name: "user1"
                    }
                },
                {
                    group:{
                        name:"group1"
                    }
                }
            ],
            commandSpec: {
                "cmdList": [
                    "/bin/vi"
                ],
                "runAs": "ALL:ALL",
                "options": "NOPASSWD:"
            }
        };

        let user = new User("user1");
        provider.managers.userManager.addValidUser(user);
        let group = new Group("group1");
        provider.managers.groupManager.addValidGroup(group);
        let se = new SudoEntry(provider,data);

        expect(se.userList.users.length).to.equal(1);
        expect(se.userList.groups.length).to.equal(1);
        se.removeUserGroup(user);
        se.removeUserGroup(group);
        expect(se.userList.users.length).to.equal(0);
        expect(se.userList.groups.length).to.equal(0);
    });


});

