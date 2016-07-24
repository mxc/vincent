/**
 * Created by mark on 2016/04/17.
 */

import Provider from '../../src/Provider';
import {expect} from 'chai';
import User from "../../src/modules/user/User";
import UserAccount from "../../src/modules/user/UserAccount";
import Host from "../../src/modules/host/Host";
import Group from "../../src/modules/group/Group";
import fs from "fs";
import path from "path";
import AppUser from '../../src/ui/AppUser';

describe("File DB save tests", function () {

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
            name: "www.example.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup:"default",
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [{name: "user1", state: "present"}]
                },
                {
                    user: {name: "user2"},
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
        }, {
            users: [
                {
                    user: {name: "user1"}
                }
            ],
            group: [
                {
                    group: {name: "group1"},
                    members: "user1"
                }
            ]
        },
        {
            name: "www.test.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup:"default",
            users: [
                {
                    user: {name: "waldo"},
                    authorized_keys: [{name: "user1"}],
                    become: true
                },
                {
                    user: {name: "user2", state: "present"},
                    authorized_keys: [{name: "user1"}],
                    become: true
                },
                {
                    user: {name: "user3"},
                    become: true
                },
                {
                    user: {name: "user4", state: "absent"},
                    become: true
                }
            ],
            groups: [
                {
                    group: {name: "group2"},
                    members: [
                        "user2"
                    ],
                    become: true,
                    becomeUser:"newton"
                },
                {
                    group: {name: "group3"},
                    members: [
                        "waldo",
                        "user2"
                    ]
                }
            ]
        },
        {
            name: "www.abc.co.za",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup:"default",
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [{name: "user1"}, {name: "user3"}, {name: "waldo"}, {name: "user4"}]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [{name: "user1"}, {name: "user4"}]
                }
            ],
            groups: [
                {
                    group: {name: "group10"},
                    members: [
                        "user2"
                    ]
                },
                {
                    group: {name: "group3"},
                    members: [
                        "waldo",
                        "user2"
                    ]
                }

            ]
        }
    ];


    var usercats = [
        {
            "name": "cat3",
            "config": [
                {
                    "user": {
                        "name": "user2",
                        "state": "present"
                    }
                },
                {
                    "user": {
                        "name": "user1",
                        "state": "present"
                    },
                    "authorized_keys": [
                        {"name": "user2", "state": "present"}
                    ]
                }
            ]
        },
        {
            "name": "cat4",
            "config": [
                {
                    "user": {
                        "name": "www-data",
                        "state": "present"
                    },
                    "authorized_keys": [
                        {"name": "user1", "state": "present"}
                    ]
                },
                {
                    "user": {
                        "name": "postgres",
                        "state": "absent"
                    }
                }
            ]
        }];


    var groupcats = [
        {
            "name": "desktop-groups",
            "config": [
                {
                    "group": {
                        "name": "group1"
                    },
                    "members": [
                        "staff1",
                        "staff2"
                    ]
                },
                {
                    "group": {
                        "name": "group2"
                    },
                    "members": [
                        "backup"
                    ]
                }
            ]
        },
        {
            "name": "server-groups",
            "config": [
                {
                    "group": {
                        "name": "group3"
                    },
                    "members": [
                        "www-data"
                    ]
                }
            ]
        }
    ];

    var sshConfigs = {
        owner: "einstein",
        group: "sysadmin",
        permissions: "770",
        configs: [
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
        ]
    };

    //inject mocks
    let home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    let provider = new Provider(path.resolve(home, "vincenttest"));
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.userManager.categories.loadFromJson(usercats);
    provider.managers.groupManager.categories.loadFromJson(groupcats);
    provider.managers.hostManager.loadHosts(hosts);
    provider.managers.sshManager.loadFromJson(sshConfigs);

    it('should save valid user and archive previous file', ()=> {
        provider.managers.userManager.save();
        var result = fs.statSync(`${provider.getDBDir()}/users.json`);
        expect(result.isFile()).to.be.true;
    });

    it('should load valid user file', ()=> {
        provider.managers.userManager.loadFromFile();
        expect(provider.managers.userManager.validUsers.length).to.equal(6);
    });

    it('should save valid groups and backup previous file', ()=> {
        provider.managers.groupManager.save();
        var result = fs.statSync(`${provider.getDBDir()}/groups.json`);
        //verify new file
        expect(result.isFile()).to.be.true;
    });

    it('should save valid hosts', ()=> {
        let host = provider.managers.hostManager.findValidHost("www.abc.co.za","default");
        let success = provider.managers.hostManager.saveHost(host);
        expect(success).to.be.true;
        var result = fs.statSync(`${provider.getDBDir()}/configs/default/${host.name}.json`);
        //verify new file
        expect(result.isFile()).to.be.true;

        host = provider.managers.hostManager.findValidHost("www.test.com","default");
        success = provider.managers.hostManager.saveHost(host);
        expect(success).to.be.true;
        result = fs.statSync(`${provider.getDBDir()}/configs/default/${host.name}.json`);
        //verify new file
        expect(result.isFile()).to.be.true;
    });

    it('should save user categories', ()=> {
        let success = provider.managers.userManager.categories.save();
        expect(success).to.be.true;
        var result = fs.statSync(`${provider.getDBDir()}/includes/user-categories.json`);
        //verify new file
        expect(result.isFile()).to.be.true;
    });

    it('should save group categories', ()=> {
        let success = provider.managers.groupManager.categories.save();
        expect(success).to.be.true;
        var result = fs.statSync(`${provider.getDBDir()}/includes/group-categories.json`);
        //verify new file
        expect(result.isFile()).to.be.true;
    });

    it('should save ssh configs', ()=> {
        let success = provider.managers.sshManager.save();
        expect(success).to.be.true;
        var result = fs.statSync(`${provider.getDBDir()}/includes/ssh-configs.json`);
        //verify new file
        expect(result.isFile()).to.be.true;
    });


});