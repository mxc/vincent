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
import HostSudoEntry from '../../src/modules/sudo/HostSudoEntry';

describe("HostSudoEntry API should", function () {

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
        }
        ];

    let provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);

    it("allow HostSudoEntry object to be created with a defined data structure", function () {
        let host = provider.managers.hostManager.findValidHost("www.example.com");
        let data =  {
            "name": "test",
            "userList": [
                {
                    "user": {
                        "name": "user1"
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
        }
        let hse = new HostSudoEntry(provider,host,data);
        expect(hse.users.length).to.equal(1);
        expect(hse.groups.length).to.equal(1);
    });

});