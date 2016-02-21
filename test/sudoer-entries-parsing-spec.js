/**
 * Created by mark on 2016/02/21.
 */
'use strict';

global.expect = require("chai").expect
import Provider from './../src/Provider';
import Loader from   '../src/utilities/Loader';
import User from "../src/coremodel/User";
import Group from "../src/coremodel/Group";
import SudoerEntries from "../src/coremodel/includes/SudoerEntries";

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
                    authorized_keys: ["user1"]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: ["user1"]
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
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;
    var loader = new Loader(provider);
    loader.loadHosts(hosts);

    it('should load sudo entries correctly', function () {
        var validHosts = [
            {
                name: "www.example.co.za",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: ["user1"]
                    },
                    {
                        user: {name: "user2", state: "absent"},
                        authorized_keys: ["user1"]
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
                        members: []
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
        expect(JSON.stringify(provider.hosts.export())).to.equal(JSON.stringify(validHosts));
    });

    it('should produce the correct line for insertion into sudoer file', function () {
        console.log(provider.hosts.find("www.example.co.za").sudoerEntries[0]
            .sudoEntry.entry);
        expect(provider.hosts.find("www.example.co.za").sudoerEntries[0].sudoEntry.entry).to.equal('%group1,user1 ALL = (ALL:ALL) NOPASSWD: /bin/vi');
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
                    authorized_keys: ["user1"]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: ["user1"]
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
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;
    var loader = new Loader(provider);
    loader.loadHosts(hosts);

    it('should not include invalid group4 in sudo entries ', function () {
        var validHosts = [
            {
                name: "www.example.com",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: ["user1"]
                    },
                    {
                        user: {name: "user2", state: "absent"},
                        authorized_keys: ["user1"]
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
                        members: []
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
        expect(JSON.stringify(provider.hosts.export())).to.equal(JSON.stringify(validHosts));
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
            "config": {
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
        },
        {
            "name": "ops",
            "config": {
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
        }
    ];

    var hosts = [
        {
            name: "www.example.com",
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: ["user1"]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: ["user1"]
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
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;
    provider.sudoerEntries = new SudoerEntries(provider, sudoerEntries);
    var loader = new Loader(provider);
    loader.loadHosts(hosts);

    it('should generate a export host string with include statement', function () {
        var validHosts = [
            {
                name: "www.example.com",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: ["user1"]
                    },
                    {
                        user: {name: "user2", state: "absent"},
                        authorized_keys: ["user1"]
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
                        members: []
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
        expect(JSON.stringify(provider.hosts.export())).to.equal(JSON.stringify(validHosts));
    });
});