/**
 * Created by mark on 2016/02/21.
 */
'use strict';

import  {assert, expect} from 'chai';
import Provider from './../../src/Provider';
import User from "../../src/modules/user/User";
import Group from "../../src/modules/group/Group";
import SudoerEntries from "../../src/modules/sudo/SudoManager";
import AppUser from '../../src/ui/AppUser';

describe("validating host configuration with sudoer entry config", function () {

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
            name: "www.example.co.za",
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
                        "name": "vi",
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
                    }
                ]
            }
        }];

    let provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);

    it('should load sudo entries correctly', function () {
        var validHosts = [
            {
                name: "www.example.co.za",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                users: [
                    {
                        user: {name: "user1", state: "present"}
                    },
                    {
                        user: {name: "user2", state: "absent"}
                    }
                ],
                groups: [
                    {
                        group: {name: "group1", state: "present"},
                        members: [
                            "user1"
                        ]
                    },
                    {
                        group: {name: "group2", state: "present"},
                    },
                    {
                        group: {name: "group3", state: "present"},
                        members: [
                            "user1"
                        ]
                    }

                ],
                config: {
                    sudoerEntries: [
                        {
                            "name": "vi",
                            "userList": [
                                {
                                    "user": {
                                        "name": "user1"
                                    }
                                }, {
                                    "group": {
                                        "name": "group1"
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
                        }
                    ]
                }
            }];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });

    it('should produce the correct line for insertion into sudoer file', function () {
        let host = provider.managers.hostManager.findValidHost("www.example.co.za");
        expect(provider.managers.sudoManager.getHostSudoerEntries(host)[0].data.entry).to.deep.equal('user1,%group1 ALL = (ALL:ALL) NOPASSWD: /bin/vi');
    });

});

describe("validating host configuration with sudo entry and invalid users", function () {

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
            users: [
                {
                    user: {name: "user1"}
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [{name: "user1"}]
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
                        "name": "vi",
                        "userList": [
                            {
                                "group": {
                                    "name": "group4"
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
                    }
                ]
            }
        }];

    let provider = new Provider();
    //provider.init();    //inject mocks
    //inject mocks
    let appUser = new AppUser("einstien", ["sysadmin"]);
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);

    it('should not include invalid group4 in sudo entries ', function () {
        var validHosts = [
            {
                name: "www.example.com",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                users: [
                    {
                        user: {name: "user1", state: "present"}
                    },
                    {
                        user: {name: "user2", state: "absent"}
                    }
                ],
                groups: [
                    {
                        group: {name: "group1", state: "present"},
                        members: [
                            "user1"
                        ]
                    },
                    {
                        group: {name: "group2", state: "present"},
                    },
                    {
                        group: {name: "group3", state: "present"},
                        members: [
                            "user1"
                        ]
                    }

                ],
                config: {
                    sudoerEntries: [
                        {
                            "name": "vi",
                            "userList": [
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
                        }
                    ]
                }
            }];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });
});

describe("validating host configuration with sudo entry include", function () {

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
        },
        {
            "name": "ops",
            "userList": [
                {
                    "user": {
                        "name": "user3"
                    }
                }
            ],
            "commandSpec": {
                "cmdList": ["/usr/local/backup.sh"],
                "runAs": "ALL:ALL"
            }
        }
    ];

    var hosts = [
        {
            name: "www.example.com",
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

            ]
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
                                    "name": "user3"
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
    provider.managers.sudoManager.loadFromJson(sudoerEntries);
    provider.managers.hostManager.loadHosts(hosts);

    it('should generate a export host string which includes sudoEntries added programatically', function () {
        var validHosts = [
            {
                name: "www.example.com",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                users: [
                    {
                        user: {name: "user1", state: "present"}
                    },
                    {
                        user: {name: "user2", state: "absent"}
                    },
                    {
                        user: {name: "user3", state: "present"}
                    }
                ],
                groups: [
                    {
                        group: {name: "group1", state: "present"},
                        members: [
                            "user1"
                        ]
                    },
                    {
                        group: {name: "group2", state: "present"}
                    },
                    {
                        group: {name: "group3", state: "present"},
                        members: [
                            "user1"
                        ]
                    }

                ],
                config: {
                    sudoerEntries: [
                        {
                            name: "dev",
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
                                cmdList: [
                                    "/bin/vi"
                                ],
                                runAs: "ALL:ALL",
                                options: "NOPASSWD:"
                            }
                        },
                        {
                            name: "ops",
                            userList: [
                                {
                                    user: {
                                        name: "user3"
                                    }
                                }
                            ],
                            commandSpec: {
                                cmdList: ["/usr/local/backup.sh"],
                                runAs: "ALL:ALL"
                            }
                        }]
                }
            }];
        let host = provider.managers.hostManager.findValidHost("www.example.com");
        provider.managers.sudoManager.addHostSudoEntry(host, "dev");
        provider.managers.sudoManager.addHostSudoEntry(host, "ops");
        expect(()=> {
            provider.managers.sudoManager.addHostSudoEntry(host, "new")
        }).to.throw(
            "new could not be found in sudo entries and is not an instance of SuDoEntry.");
        expect(host.export()).to.deep.equal(validHosts[0]);
    });

    it('should not add users/groups to sudo entry which are not valid for the host', function () {
        var validHost =
        {
            name: "www.example.co.za",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            users: [
                {
                    user: {name: "user1", state: "present"}
                },
                {
                    user: {name: "user2", state: "absent"}
                }
            ],
            groups: [
                {
                    group: {name: "group1", state: "present"},
                    members: [
                        "user1"
                    ]
                },
                {
                    group: {name: "group2", state: "present"}
                },
                {
                    group: {name: "group3", state: "present"},
                    members: [
                        "user1"
                    ]
                }

            ],
            config: {
                sudoerEntries: [
                    {
                        name: "ops",
                        userList: [
                            {
                                user: {
                                    name: "user3"
                                },
                                group: {
                                    name: "invalidgroup"
                                }
                            }
                        ],
                        commandSpec: {
                            cmdList: ["/usr/local/backup.sh"],
                            runAs: "ALL:ALL"
                        }
                    }]
            }
        };
        console.log("calling");
        let host = provider.managers.hostManager.loadFromJson(validHost);
        console.log("bye");
        console.log(provider.managers.sudoManager.getHostSudoerEntries(host));
        expect(provider.managers.sudoManager.getHostSudoerEntries(host)[0].userList.users.length).to.equal(0);
        expect(provider.managers.sudoManager.getHostSudoerEntries(host)[0].userList.groups.length).to.equal(0);
    });

});