'use strict';


import Provider from '../src/model/Provider';
import User from "../src/model/User";
import Group from "../src/model/Group";
import SshConfigs from "../src/model/includes/SshConfigs";
import UserCategories from "../src/model/includes/UserCategories";

global.expect = require("chai").expect;


var Controller = require('../src/modules/Controller').default;
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
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: ["user1", "user2"]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: ["user2"]
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
            ssh: {
                permitRoot: "no",
                passwordAuthentication: "no",
                validUsersOnly: "yes"
            }
        }
    ];

    var provider = new Provider();
    //inject mocks
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;
    var base = new Controller(provider);
    base.validateHosts(hosts);

    it("should return an collection of valid hosts including ssh configs", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        user: {
                            name: "user1",
                            state: "present",
                        },
                        authorized_keys: ["user1"]
                    }, {
                        user: {
                            name: "user2",
                            state: "absent"
                        },
                        authorized_keys: []
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
                        },
                        members: []
                    }
                ],
                ssh: {
                    permitRoot: false,
                    validUsersOnly: true,
                    passwordAuthentication: false
                }
            }
        ];
        expect(JSON.stringify(provider.hosts.export())).to.equal(JSON.stringify(validHosts));
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
            "name": "strict",
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
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: ["user1", "user2"]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: ["user2"]
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
            includes: [
                {
                    ssh: "strict"
                }
            ]
        }
    ];

    var provider = new Provider();
    //inject mocks
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;
    provider.sshconfigs = new SshConfigs(provider, sshConfigs);
    var base = new Controller(provider);
    base.validateHosts(hosts);

    it("should return an collection of valid hosts including ssh configs", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        user: {
                            name: "user1",
                            state: "present",
                        },
                        authorized_keys: ["user1"]
                    }, {
                        user: {
                            name: "user2",
                            state: "absent"
                        },
                        authorized_keys: []
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
                        },
                        members: []
                    }
                ],
                includes: [
                    {ssh: "strict"}
                ]
            }
        ];
        expect(JSON.stringify(provider.hosts.export())).to.equal(JSON.stringify(validHosts));
        let host = provider.hosts.find("web01.example.co.za");

        expect(host.ssh).to.deep.equal({
            permitRoot: false,
            validUsersOnly: true,
            passwordAuthentication: false
        });
    });
});


describe("validating user categories include", function () {

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

    var userCategories = [
        {
            "name": "cat1",
            "config": [
                {name: "user1", state: "absent", authorized_keys: ["user2", "user1"]},
                {name: "user2"}
            ]
        },
        {
            "name": "cat2",
            "config": [
                {name: "user3", state: "present"},
                {name: "user1", authorized_keys: ["user2", "user1"]}
            ]
        }
    ];

    var hosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        name: "userA",
                        authorized_keys: ["user1", "user2"]
                    }
                ],
                includes: [
                    {
                        userCategories: ["cat1", "cat2"]
                    }
                ],
                groups: [
                    {
                        name: "group1",
                        members: ["user1", "user2", "user3"]
                    },
                    {
                        name: "group2",
                        members: ["user2"]
                    }
                ]
            }
        ]
        ;

    var provider = new Provider();
    var base = new Controller(provider);
    //inject mocks
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;
    provider.userCategories = new UserCategories(provider, userCategories);

    var parsedHosts = base.validateHosts(hosts);

    it("should return an collection of valid hosts including users from " +
        "user categories configs", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        name: "userA",
                        authorized_keys: ["user1", "user2"],
                        state: "present"
                    }
                ],
                includes: [
                    {
                        userCategories: ["cat1", "cat2"]
                    }
                ],
                groups: [
                    {
                        name: "group1",
                        members: ["user1", "user2"]
                    },
                    {
                        name: "group2",
                        members: ["user2"]
                    }
                ]
            }
        ];

        var validHosts2 = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        name: "userA",
                        authorized_keys: ["user1", "user2"],
                        state: "present"
                    },
                    {
                        name: "user1",
                        state: "present",
                        authorized_keys: ["user1"]
                    }, {
                        name: "user2",
                        state: "present",
                        authorized_keys: ["user2", "user1"]
                    }, {
                        name: "user3",
                        state: "absent"
                    }
                ],
                groups: [
                    {
                        name: "group1",
                        members: ["user1", "user2"]
                    },
                    {
                        name: "group2",
                        members: ["user2"]
                    }
                ]
            }
        ];
        expect(parsedHosts).to.equal(validHosts);
    });
});
//
//describe("validating group categories include", function () {
//
//    var validUsers = [
//        {
//            name: "user1",
//            key: "user1.pub",
//            uid: 1100,
//            state: "present"
//        },
//        {
//            name: "user2",
//            key: "user2.pub",
//            uid: 1200,
//            state: "present"
//        },
//        {
//            name: "user3",
//            state: "absent"
//        },
//        {
//            name: "userA",
//            state: "present"
//        }
//    ];
//
//    var validGroups = [
//        {name: "group1", gid: 1000},
//        {name: "group2", gid: 2000},
//        {name: "group3"},
//        {name: "group3"},
//        {name: "group4"},
//        {name: "group5"},
//        {name: "group6"},
//        {name: "group7"}
//    ];
//
//    var userCategories = {
//        cat1: [
//            {name: "user1", authorized_keys: ["user1"]},
//            {name: "user2", authorized_keys: ["user2", "user1"]}
//        ],
//        cat2: [
//            {name: "user3", authorized_keys: ["user2", "user3"]},
//            {name: "user1"}
//        ]
//    };
//
//    var groupCategories = {
//        groupcat1: [
//            {name: "group4", members: ["user1"]},
//            {name: "group5", members: ["user2", "user1"]}
//        ],
//        groupcat2: [
//            {name: "group6", members: ["user"]},
//            {name: "group7", members: ["cat1"]}
//        ]
//    };
//
//    var hosts = [
//        {
//            name: "web01.example.co.za",
//            users: [
//                {
//                    name: "userA",
//                    authorized_keys: ["user1", "user2"]
//                }
//            ],
//            includes: [
//                {
//                    group_categories: [
//                        "groupcat1", "groupcat2"
//                    ]
//                }
//            ],
//            groups: [
//                {
//                    name: "group1",
//                    members: ["user1", "user2", "user3"]
//                },
//                {
//                    name: "group2",
//                    members: ["user2"]
//                }
//            ],
//        }
//    ];
//
//    var base = new Controller(validUsers, validGroups, hosts);
//    base.setUserCategories(userCategories);
//    base.setGroupCategories(groupCategories);
//    base.parsedUsers = validUsers;
//    var parsedHosts = base.validateHosts(validUsers, validGroups);
//
//    it("should return an collection of valid hosts including group categories", function () {
//        var validHosts = [
//            {
//                name: "web01.example.co.za",
//                users: [
//                    {
//                        name: "userA",
//                        authorized_keys: ["user1", "user2"],
//                        state: "present"
//                    },
//                    {
//                        name: "user1",
//                        state: "present",
//                        authorized_keys: ["user1"]
//                    }, {
//                        name: "user2",
//                        state: "present",
//                        authorized_keys: ["user2", "user1"]
//                    }, {
//                        name: "user3",
//                        state: "absent"
//                    }
//                ],
//                groups: [
//                    {
//                        name: "group1",
//                        members: ["user1", "user2"]
//                    },
//                    {
//                        name: "group2",
//                        members: ["user2"]
//                    },
//                    {
//                        name: "group4",
//                        members: ["user1"]
//                    },
//                    {
//                        name: "group5",
//                        members: ["user2", "user1"]
//                    },
//                    {
//                        name: "group6",
//                        members: ["user"]
//                    },
//                    {
//                        name: "group7",
//                        members: ["user1"]
//                    }
//                ]
//            }
//        ];
//        expect(parsedHosts).to.equal(validHosts);
//    });
//});
//
//
//describe("validating group categories include with duplicated groups", function () {
//
//    var validUsers = [
//        {
//            name: "user1",
//            key: "user1.pub",
//            uid: 1100,
//            state: "present"
//        },
//        {
//            name: "user2",
//            key: "user2.pub",
//            uid: 1200,
//            state: "present"
//        },
//        {
//            name: "user3",
//            state: "absent"
//        },
//        {
//            name: "userA",
//            state: "present"
//        },
//        {
//            name: "user",
//            state: "present"
//        }
//    ];
//
//    var validGroups = [
//        {name: "group1", gid: 1000},
//        {name: "group2", gid: 2000},
//        {name: "group3"},
//        {name: "group4"},
//        {name: "group5"},
//        {name: "group6"},
//        {name: "group7"}
//    ];
//
//    var userCategories = {
//        cat1: [
//            {name: "user1", authorized_keys: ["user1"]},
//            {name: "user2", authorized_keys: ["user2", "user1"]}
//        ],
//        cat2: [
//            {name: "user3", authorized_keys: ["user2", "user3"]},
//            {name: "user1"}
//        ]
//    };
//
//    var groupCategories = {
//        groupcat1: [
//            {name: "group4", members: ["user1"]},
//            {name: "group5", members: ["user2", "user1"]}
//        ],
//        groupcat2: [
//            {name: "group6", members: ["user"]},
//            {name: "group7", members: ["cat1"]}
//        ]
//    };
//
//    var hosts = [
//        {
//            name: "web01.example.co.za",
//            users: [
//                {
//                    name: "userA",
//                    authorized_keys: ["user1", "user2"]
//                }
//            ],
//
//            groups: [
//                {
//                    name: "group1",
//                    members: ["user1", "user2", "user3"]
//                },
//                {
//                    name: "group2",
//                    members: ["user2"]
//                },
//                {
//                    name: "group4",
//                    members: ["user3"]
//                }
//            ],
//            includes: [
//                {user_categories: ["cat1", "cat2"]},
//                {group_categories: ["groupcat1", "groupcat2"]}
//            ]
//        }
//    ];
//
//    var base = new Controller(validUsers, validGroups, hosts);
//    base.setUserCategories(userCategories);
//    base.setGroupCategories(groupCategories);
//    base.parsedUsers = validUsers;
//    var parsedHosts = base.validateHosts(validUsers, validGroups);
//
//    it("should return an collection of valid hosts including deduplicated group categories", function () {
//        var validHosts = [
//            {
//                name: "web01.example.co.za",
//                users: [
//                    {
//                        name: "userA",
//                        authorized_keys: ["user1", "user2"],
//                        state: "present"
//                    },
//                    {
//                        name: "user1",
//                        state: "present",
//                        authorized_keys: ["user1"]
//                    }, {
//                        name: "user2",
//                        state: "present",
//                        authorized_keys: ["user2", "user1"]
//                    }, {
//                        name: "user3",
//                        state: "absent"
//                    }
//                ],
//                groups: [
//                    {
//                        name: "group1",
//                        members: ["user1", "user2"]
//                    },
//                    {
//                        name: "group2",
//                        members: ["user2"]
//                    },
//                    {
//                        name: "group4",
//                        members: ["user1", "user3"]
//                    },
//                    {
//                        name: "group5",
//                        members: ["user2", "user1"]
//                    },
//                    {
//                        name: "group6",
//                        members: ["user"]
//                    },
//                    {
//                        name: "group7",
//                        members: ["user1", "user2"]
//                    }
//                ]
//            }
//        ];
//        expect(parsedHosts).to.equal(validHosts);
//    });
//});