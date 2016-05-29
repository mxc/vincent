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
import HostGroup from '../../src/modules/group/HostGroup';


describe("SudoerManager API should", function () {

    var validUsers = [
        new User({name: 'user1', key: 'user1.pub', state: 'present', uid: undefined}),
        new User({name: 'user2', key: undefined, state: 'absent', uid: undefined}),
        new User({name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'}),
        new User({name: 'user4', key: undefined, state: 'present', uid: undefined})
    ];

    var validGroups = [
        new Group({
            name: 'group1',
            gid: undefined,
            state: 'present'
        }),
        new Group({
            name: 'group2',
            gid: undefined,
            state: 'present'
        }),
        new Group({
            name: 'group3',
            gid: 1000,
            state: 'present'
        })
    ];

    var sudoerEntries = [
        {
            "name": "dev",
            "userList": [
                {
                    "group": {
                        "name": "group1"
                    }
                },
                {
                    "user": {
                        "name": "user1"
                    }
                }
            ],
            "commandSpec": {
                "cmdList": [
                    "/bin/vi"
                ],
                "runAs": "ALL:ALL",
                "options": "NOPASSWD:"
            }
        }];

    var hosts = [
        {
            name: "www.example.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            users: [
                {
                    user: {name: "user1"},
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [{name: "user1"}]
                },
                {
                    user: {name: "user3", state: "present"}
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

            ],
            config: {
                sudoerEntries: [
                    {
                        name: 'bacup',
                        "userList": [
                            {
                                "group": {
                                    "name": "group1"
                                }
                            },
                            {
                                "user": {
                                    "name": "user1"
                                }
                            }
                        ],
                        "commandSpec": {
                            "cmdList": [
                                "/bin/vi"
                            ],
                            "runAs": "ALL:ALL",
                            "options": "NOPASSWD:"
                        }
                    },
                    {
                        "name": "ops",
                        "userList": [
                            {
                                "user": {
                                    "name": "user1"
                                }
                            },
                            {
                                "user": {
                                    "name": "user3"
                                }
                            },
                            {
                                "group": {
                                    name: "group1"
                                }
                            }
                        ],
                        "commandSpec": {
                            "cmdList": ["/usr/local/backup.sh"],
                            "runAs": "ALL:ALL"
                        }
                    }]
            }
        },
        {
            name: "www.test.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [{name: "user1"}]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [{name: "user1"}]
                },
                {
                    user: {name: "user3", state: "present"}
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

            ],
            config: {
                sudoerEntries: [
                    {
                        name: 'dev',
                        "userList": [
                            {
                                "group": {
                                    "name": "group1"
                                }
                            },
                            {
                                "group": {
                                    "name": "group3"
                                }
                            },
                            {
                                "user": {
                                    "name": "user2"
                                }
                            }
                        ],
                        "commandSpec": {
                            "cmdList": [
                                "/bin/vi"
                            ],
                            "runAs": "ALL:ALL",
                            "options": "NOPASSWD:"
                        }
                    },
                    {
                        "name": "ops",
                        "userList": [
                            {
                                "user": {
                                    "name": "user1"
                                }
                            }
                        ],
                        "commandSpec": {
                            "cmdList": ["/usr/local/backup.sh"],
                            "runAs": "ALL:ALL"
                        }
                    }]
            }
        }];

    let provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);

    it("provide a list of validHosts with sudoEntries that contain a user", function () {
        let hosts = provider.managers.sudoManager.findHostsWithSudoEntriesForUser("user1");
        expect(hosts.length).to.equal(2);
        hosts = provider.managers.sudoManager.findHostsWithSudoEntriesForUser("user2");
        expect(hosts.length).to.equal(1);
    });

    it("provide a list of validHosts with sudoEntries that contain a group", function () {
        let host = provider.managers.sudoManager.findHostsWithSudoEntriesForGroup("group1");
        expect(hosts.length).to.equal(2);
        host = provider.managers.sudoManager.findHostsWithSudoEntriesForGroup("group3");
        expect(hosts.length).to.equal(2);
    });

    it("provide a list of HostSudoEntries that contain a user", function () {
        let hses = provider.managers.sudoManager.findHostSudoEntriesForUser("user1");
        expect(hses.length).to.equal(3);
        hses = provider.managers.sudoManager.findHostSudoEntriesForUser("user3");
        expect(hses.length).to.equal(1);
    });

    it("remove user from SudoEntries when removeUserGroupFromHostSUDOEntries is called",()=> {
        let host = provider.managers.hostManager.findValidHost("www.test.com");
        let user = provider.managers.userManager.findValidUser("user2");
        provider.managers.sudoManager.removeUserGroupFromHostSudoEntries(host,user);
        let hses = provider.managers.sudoManager.getHostSudoerEntries(host);
        let hse = hses.find((hse)=> {
            return hse.userList.users.find((user)=> {
                if (user.name == "user2") {
                    return user;
                }
            });
        });
        expect(hse).to.equal(undefined);
        //reload valid hosts
        provider.managers.hostManager.clear();
        provider.managers.hostManager.loadHosts(hosts);
    });

    it("remove groups from SudoEntries when removeUserGroupFromHostSUDOEntries is called",()=> {
        let host = provider.managers.hostManager.findValidHost("www.test.com");
        let group = provider.managers.groupManager.findValidGroup("group1");
        provider.managers.sudoManager.removeUserGroupFromHostSudoEntries(host,group);
        let hses = provider.managers.sudoManager.getHostSudoerEntries(host);
        let hse = hses.find((hse)=> {
            return hse.userList.groups.find((group)=> {
                if (group.name == "group1") {
                    return group;
                }
            });
        });
        expect(hse).to.equal(undefined);
        //reload valid hosts
        provider.managers.hostManager.clear();
        provider.managers.hostManager.loadHosts(hosts);
    });

    it("add a sudo entry to a host when addSudoEntry is called",()=>{
            provider.managers.sudoManager.loadFromJson(sudoerEntries);
            let host = new Host(provider,"www.dogz.co.za","einstein","sysadmin",700);

            let user = provider.managers.userManager.findValidUserByName("user1");
            let userAccount = new UserAccount(provider,{user:user});
            provider.managers.userManager.addUserAccountToHost(host,userAccount);

            let group = provider.managers.groupManager.findValidGroup("group1");
            let hostGroup = new HostGroup(provider,{group:group});
            provider.managers.groupManager.addHostGroupToHost(host,hostGroup);

            provider.managers.hostManager.addHost(host);

            let sudoEntry = provider.managers.sudoManager.findSudoEntry("dev");
            provider.managers.sudoManager.addHostSudoEntry(host,sudoEntry);
            expect(host.data.config.get("sudoerEntries")[0].sudoEntry.name).to.equal("dev");
    });


});
