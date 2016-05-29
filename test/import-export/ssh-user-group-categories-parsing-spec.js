'use strict';


import Provider from '../../src/Provider';
import User from "../../src/modules/user/User";
import Group from "../../src/modules/group/Group";
import {expect} from 'chai';
import AppUser from '../../src/ui/AppUser';
import fs from 'fs';
import path from 'path';

describe("validating ssh custom config", function () {

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

    var hosts = [
        {
            name: "web01.example.co.za",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [{name: "user1"}, {name: "user2"}]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [{name: "user2"}]
                }
            ],
            groups: [
                {
                    group: {name: "group1"},
                    members: ["user1", "user2"]
                },
                {
                    group: {name: "group2"},
                    members: ["user2"]
                }
            ],
            config: {
                ssh: {
                    permitRoot: "no",
                    passwordAuthentication: "no",
                    validUsersOnly: "yes"
                }
            }
        }
    ];

    let provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);

    it("should return a collection of valid hosts including ssh configs", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                users: [
                    {
                        user: {
                            name: "user1",
                            state: "present"
                        }
                    }, {
                        user: {
                            name: "user2",
                            state: "absent"
                        }
                    }
                ],
                groups: [
                    {
                        group: {
                            name: "group1",
                            state: "present"
                        },
                        members: ["user1"]
                    },
                    {
                        group: {
                            name: "group2",
                            state: "present"
                        }
                    }
                ],
                config: {
                    ssh: {
                        permitRoot: false,
                        validUsersOnly: true,
                        passwordAuthentication: false
                    }
                }
            }
        ];
        let host = provider.managers.hostManager.findValidHost("web01.example.co.za");
        expect(host.export()).to.deep.equal(validHosts[0]);

    });
});


describe("validating ssh include config", function () {

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

    var sshConfigs = [
        {
            name: "strict",
            config: {
                permitRoot: "no",
                validUsersOnly: "true",
                passwordAuthentication: "no"
            }
        },
        {
            name: "strict_with_root",
            config: {
                permitRoot: "without-password",
                validUsersOnly: "true",
                passwordAuthentication: "no"
            }
        },
        {
            name: "loose",
            config: {
                permitRoot: "yes",
                validUsersOnly: "false",
                passwordAuthentication: "yes"
            }
        }
    ];

    var hosts = [
        {
            name: "web01.example.co.za",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [{name: "user1"}, {name: "user2"}]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [{name: "user2"}]
                }
            ],
            groups: [
                {
                    group: {name: "group1"},
                    members: ["user1", "user2"]
                },
                {
                    group: {name: "group2"},
                    members: ["user2"]
                }
            ]
        }
    ];

    let provider = new Provider();
    //provider.init();    //inject mocks
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.sshManager.loadFromJson(sshConfigs);
    provider.managers.hostManager.loadHosts(hosts);

    it("should return a collection of valid hosts including ssh include configs translated into ssh objects", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                users: [
                    {
                        user: {
                            name: "user1",
                            state: "present"
                        }
                    }, {
                        user: {
                            name: "user2",
                            state: "absent"
                        }
                    }
                ],
                groups: [
                    {
                        group: {
                            name: "group1",
                            state: "present"
                        },
                        members: ["user1"]
                    },
                    {
                        group: {
                            name: "group2",
                            state: "present"
                        }
                    }
                ],
                config: {
                    ssh:{
                        permitRoot: false,
                        validUsersOnly: true,
                        passwordAuthentication: false
                    }
                }
            }
        ];
        //find host added on test suite start
        let host = provider.managers.hostManager.findValidHost("web01.example.co.za");
        provider.managers.sshManager.addSsh(host,"strict");
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
        let ssh = provider.managers.sshManager.getSsh(host);
        expect(ssh.export()).to.deep.equal({
            permitRoot: false,
            validUsersOnly: true,
            passwordAuthentication: false
        });
    });
});