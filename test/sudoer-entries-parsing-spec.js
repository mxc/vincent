/**
 * Created by mark on 2016/02/21.
 */
'use strict';

import  {assert, expect} from 'chai';
import Provider from './../src/Provider';
import Loader from   '../src/utilities/FileDbLoader';
import User from "../src/modules/user/User";
import Group from "../src/modules/group/Group";
import SudoerEntries from "../src/modules/sudo/SudoManager";

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
        }];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    //var loader = new Loader(provider);
    provider.managers.hostManager.loadHosts(hosts);

    it('should loadFromJson sudo entries correctly', function () {
        var validHosts = [
            {
                name: "www.example.co.za",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: [{name: "user1", state: "present"}]
                    },
                    {
                        user: {name: "user2", state: "absent"},
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
                sudoerEntries: [
                    {
                        "name": "vi",
                        "userList": [
                            {
                                "group": {
                                    "name": "group1",
                                    "state": "present"
                                }
                            },
                            {
                                "user": {
                                    "name": "user1",
                                    "state": "present"
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
            }];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });

    it('should produce the correct line for insertion into sudoer file', function () {
        expect(provider.managers.hostManager.find("www.example.co.za").sudoerEntries[0].sudoEntry.entry).to.equal('%group1,user1 ALL = (ALL:ALL) NOPASSWD: /bin/vi');
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
        }];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    //var loader = new Loader(provider);
    provider.managers.hostManager.loadHosts(hosts);

    it('should not include invalid group4 in sudo entries ', function () {
        var validHosts = [
            {
                name: "www.example.com",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: [{name: "user1", state: "present"}]
                    },
                    {
                        user: {name: "user2", state: "absent"},
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
                sudoerEntries: [
                    {
                        "name": "vi",
                        "userList": [
                            {
                                "user": {
                                    "name": "user1",
                                    "state": "present"
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
            includes: {
                sudoerEntries: ["dev", "ops"]
            }
        }];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.sudoerEntries.load(sudoerEntries);
    //var loader = new Loader(provider);
    provider.managers.hostManager.loadHosts(hosts);

    it('should generate a export host string with include statement for sudoEntries', function () {
        var validHosts = [
            {
                name: "www.example.com",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: [{name: "user1", state: "present"}]
                    },
                    {
                        user: {name: "user2", state: "absent"},
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
                includes: {
                    sudoerEntries: ["dev", "ops"]
                }
            }];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });
});