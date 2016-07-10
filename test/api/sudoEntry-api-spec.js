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
import HostSudoEntry from '../../src/modules/sudo/HostSudoEntry';
import HostGroup from '../../src/modules/group/HostGroup';


describe("SudoeEntry API should", function () {

    let provider = new Provider();

    it("allow for the creation of a SudoEntry object with a defined data structure", ()=> {
        let data = {
            name: "reboot",
            userList: [
                {
                    user: {
                        name: "user1"
                    }
                },
                {
                    group: {
                        name: "group1"
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
        let se = new SudoEntry(provider, data);
        expect(se.userList.users.length).to.equal(1);
        expect(se.userList.groups.length).to.equal(1);
        provider.managers.userManager.clear();
        provider.managers.groupManager.clear();
    });

    it("not allow users or groups in the userlist which are not valid", ()=> {
        let data = {
            name: "reboot",
            userList: [
                {
                    user: {
                        name: "user1"
                    }
                },
                {
                    group: {
                        name: "group1"
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
        let se = new SudoEntry(provider, data);
        //if user is not in valid users then user is not loaded to sudoEntry
        expect(se.userList.users.length).to.equal(0);
        //if group is not in valid groups then group is not loaded to sudoEntry
        expect(se.userList.groups.length).to.equal(0);
    });

    it("allow for the addition of users and groups after construction", ()=> {
        let data = {
            name: "reboot",
            userList: [
                {
                    user: {
                        name: "user1"
                    }
                },
                {
                    group: {
                        name: "group1"
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
        let se = new SudoEntry(provider, data);
        expect(se.userList.users.length).to.equal(1);
        expect(se.userList.groups.length).to.equal(1);
        se.addUser("user2");
        se.addGroup("group2")
        expect(se.userList.users.length).to.equal(2);
        expect(se.userList.groups.length).to.equal(2);
        provider.managers.userManager.clear();
        provider.managers.groupManager.clear();
    });

    it("not allow users or groups to be removed after construction", ()=> {
        let data = {
            name: "reboot",
            userList: [
                {
                    user: {
                        name: "user1"
                    }
                },
                {
                    group: {
                        name: "group1"
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
        let se = new SudoEntry(provider, data);

        expect(se.userList.users.length).to.equal(1);
        expect(se.userList.groups.length).to.equal(1);
        se.removeUserGroup(user);
        se.removeUserGroup(group);
        expect(se.userList.users.length).to.equal(0);
        expect(se.userList.groups.length).to.equal(0);
    });

    it("should create a valid HostSudoEntry instance",()=>{
        var groups = {
            "owner": "root",
            "group": "groupadmin",
            "permissions": "660",
            "groups": [
                {name: 'group1'},
                {name: 'group2'},
                {name: 'group2'},
                {name: 'group3', gid: 1000},
                {name: 'group4', gid: 1000},
                {gid: 10001}
            ]
        };

        var users = {
            "owner": "root",
            "group": "useradmin",
            "permissions": "660",
            "users": [
                {name: 'user1', key: 'user1.pub', state: 'present'},
                {name: 'user2', state: 'absent'},
                {name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'},
                {name: 'user4', state: 'present'},
                {name: 'user6', state: 'present', uid: 1001}
            ]
        };

        var host = {
            name: "www.example.co.za",
            owner: "einstein",
            group: "sysadmin",
            permissions: 77,
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [{name: "user1", state: "present"}]
                },
                {
                    user: {name: "user3"},
                    authorized_keys: [
                        {name: "user1", state: "present"},
                        {name: "user2", state: "absent"}
                    ]
                }
            ],
            groups: [
                {
                    group: {name: "group1"},
                    members: [
                        "user1"
                    ]
                },
                {
                    group: {name: "group2"},
                    members: [
                        "user2"
                    ]
                },
                {
                    group: {name: "group3"},
                    members: [
                        "user1",
                        "user2"
                    ]
                }
            ]
        };

        let data = {
            name: "reboot",
            userList: [
                {
                    user: {
                        name: "user1"
                    }
                },
                {
                    group: {
                        name: "group1"
                    }
                }
            ],
            commandSpec: {
                "cmdList": [
                    "/bin/vi"
                ],
                "runAs": "ALL:ALL",
                "options": "NOPASSWD:"
            },
            become:true,
            becomeUser:"newton"
        };

        let provider = new Provider();
        //inject mocks
        provider.managers.groupManager.loadFromJson(groups);
        provider.managers.userManager.loadFromJson(users);
        let h = provider.managers.hostManager.loadFromJson(host);
        let hse = new HostSudoEntry(provider,h, data);
        expect(hse.become).to.be.true;
        expect(hse.becomeUser).to.equal("newton");
    });


});

