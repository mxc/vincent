'use strict';


import Provider from '../src/Provider';
import User from "../src/modules/user/User";
import Group from "../src/modules/group/Group";
import {assert,expect} from 'chai';

//global.expect = require("chai").expect;

var Loader = require('../src/utilities/FileDbLoader').default;
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
            ssh: {
                permitRoot: "no",
                passwordAuthentication: "no",
                validUsersOnly: "yes"
            }
        }
    ];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    var loader = new Loader(provider);
    loader.loadHosts(hosts);

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
                        authorized_keys: [{name: "user1", state: "present"}]
                    }, {
                        user: {
                            name: "user2",
                            state: "absent"
                        },
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
                ssh: {
                    permitRoot: false,
                    validUsersOnly: true,
                    passwordAuthentication: false
                }
            }
        ];
        assert.deepEqual(provider.managers.hostManager.export(),validHosts);

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
            includes: {
                ssh: "strict"
            }
        }
    ];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.sshConfigs.load(sshConfigs);
    var loader = new Loader(provider);
    loader.loadHosts(hosts);

    it("should return an collection of valid hosts including ssh configs", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        user: {
                            name: "user1",
                            state: "present"
                        },
                        authorized_keys: [{name: "user1", state:"present"}]
                    }, {
                        user: {
                            name: "user2",
                            state: "absent"
                        },
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
                    }
                ],
                includes: {
                    ssh: "strict"
                }
            }
        ];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
        let host = provider.managers.hostManager.find("web01.example.co.za");

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
        new User({name: 'userA', key: 'userA.pub', state: 'present', uid: undefined}),
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
                {
                    user: {
                        name: "user1",
                        state: "absent"
                    },
                    authorized_keys: [
                        {name: "user2"},
                        {name: "user1"}]
                },
                {user: {name: "user2"}}
            ]
        },
        {
            "name": "cat2",
            "config": [
                {user: {name: "user3", state: "present"}},
                {user: {name: "user1"}, authorized_keys: [{name: "user2"}, {name: "user1"}]}
            ]
        }
    ];

    var hosts = [
        {
            name: "web01.example.co.za",
            users: [
                {
                    user: {name: "userA"},
                    authorized_keys: [{name: "user1"}, {name: "user2"}]
                }
            ],
            includes: {
                userCategories: ["cat1", "cat2"]
            },
            groups: [
                {
                    group: {name: "group1"},
                    members: ["user1", "user2", "user3"]
                },
                {
                    group: {name: "group2"},
                    members: ["user2"]
                }
            ]
        }
    ];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.userManager.userCategories.loadFromJson(userCategories);
    var loader = new Loader(provider);
    loader.loadHosts(hosts);
    it("should return a collection of valid hosts including users from " +
        "user categories configs", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        user: {
                            name: "userA",
                            state: "present"
                        },
                        authorized_keys: [{name: "user1", state:"present"}]
                    }
                ],
                groups: [
                    {
                        group: {name: "group1", state: "present"},
                        members: ["user1", "user3"]
                    },
                    {
                        group: {name: "group2", state: "present"}
                    }
                ],
                includes: {
                    userCategories: ["cat1", "cat2"]

                }
            }
        ];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });

    it('should addValidGroup the users in user category to the host\'s users' +
        ' and not addValidGroup duplicates', function () {
        expect(provider.managers.userManager.getHostUsers(provider.managers.hostManager.find("web01.example.co.za")).length).to.equal(4);
    })
});


describe("validating group categories include", function () {

    var validUsers = [
        new User({name: 'user1', key: 'user1.pub', state: 'present', uid: undefined}),
        new User({name: 'userA', key: 'userA.pub', state: 'present', uid: undefined}),
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
        }),
        new Group({
            name: 'group4',
            gid: 1001,
            state: 'present'
        }),
        new Group({
            name: 'group7',
            gid: 1002,
            state: 'present'
        })
    ];

    var groupCategories = [
        {
            name: "groupcat1",
            config: [
                {group: {name: "group4"}, members: ["user1"]},
                {group: {name: "group5"}, members: ["user2", "user1"]}
            ]
        },
        {
            name: "groupcat2",
            config: [
                {group: {name: "group6"}, members: ["user"]},
                {group: {name: "group7"}, members: ["user2", "user3"]}
            ]
        }
    ];

    var hosts = [
        {
            name: "web01.example.co.za",
            users: [
                {
                    user: {name: "userA"},
                    authorized_keys: [{name: "user1"}, {name: "user2"}]
                },
                {
                    user: {name: "user3"},
                    authorized_keys: [{name: "user1"}, {name: "user3"}]
                },
                {
                    user: {name: "user1"},
                    authorized_keys: [{name: "user1"}]
                }
            ],
            includes: {
                groupCategories: ["groupcat1", "groupcat2"]
            },
            groups: [
                {
                    group: {name: "group1"},
                    members: ["user1", "user2", "user3"]
                },
                {
                    group: {name: "group2"},
                    members: ["user2"]
                }
            ]
        }
    ];

    var provider = new Provider();
    var loader = new Loader(provider);
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.groupManager.groupCategories.load(groupCategories);
    loader.loadHosts(hosts);

    it("should return a collection of valid hosts including group categories", function () {
        var validHosts = [
                {
                    name: "web01.example.co.za",
                    users: [
                        {
                            user: {name: "userA", state: "present"},
                            authorized_keys: [{
                                name: "user1",
                                state: "present"
                            }]
                        },
                        {
                            user: {name: "user3", state: "present"},
                            authorized_keys: [
                                {
                                    name: "user1",
                                    state: "present"
                                },
                                {name: "user3", state:"present"}
                            ]
                        },
                        {
                            user: {name: "user1", state: "present"},
                            authorized_keys: [{name: "user1", state:"present" }]
                        }
                    ],
                    groups: [
                        {
                            group: {name: "group1", state: "present"},
                            members: ["user1", "user3"]
                        },
                        {
                            group: {name: "group2", state: "present"}
                        }
                    ],
                    includes: {
                        groupCategories: ["groupcat1", "groupcat2"]
                    }
                }
            ]
            ;
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });

    it('should add the groups in group category to the host\'s groups', function () {
        expect(provider.managers.groupManager.getGroups(provider.managers.hostManager.find("web01.example.co.za")).length).to.equal(4);
    })

    it('should not add invalid groups in the group category', function () {
        expect(loader.errors.indexOf('Error adding group5 from group category ' +
            'groupcat1 - The group group5 does not exist in valid groups.')).to.not.equal(-1);
    });

    it('should not add invalid users as group members', function () {
        expect(loader.errors.indexOf('There was an error adding members' +
            ' to the group group1. Cannot add member to group. Parameter' +
            ' user with name user2 is not a valid user or user is absent.')).to.not.equal(-1);
    })
});


describe("validating group categories include with duplicated groups", function () {

    var validUsers = [
        new User({name: 'user1', key: 'user1.pub', state: 'present', uid: undefined}),
        new User({name: 'userA', key: 'userA.pub', state: 'present', uid: undefined}),
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
        }),
        new Group({
            name: 'group4',
            gid: 1001,
            state: 'present'
        }),
        new Group({
            name: 'group7',
            gid: 1002,
            state: 'present'
        })
    ];

    var userCategories = [
        {
            "name": "cat1",
            "config": [
                {
                    user: {name: "user1", state: "present"}, authorized_keys: [
                    {name: "user2"},
                    {name: "user1"}
                ]
                },
                {user: {name: "user2"}}
            ]
        },
        {
            "name": "cat2",
            "config": [
                {user: {name: "user3"}, state: "present"},
                {user: {name: "user1"}, authorized_keys: [{name:"user2"}, {name:"user1"}]}
            ]
        }
    ];

    var groupCategories = [
        {
            name: "groupcat1",
            config: [
                {group: {name: "group1"}, members: ["user1"]},
                {group: {name: "group5"}, members: ["user2", "user1"]}
            ]
        },
        {
            name: "groupcat2",
            config: [
                {group: {name: "group7"}, members: ["user1"]},
                {group: {name: "group2"}, members: ["cat1"]}
            ]
        }
    ];

    var hosts = [
        {
            name: "web01.example.co.za",
            users: [
                {
                    user: {name: "userA"},
                    authorized_keys: [{name: "user1"}, {name: "user2"}]
                },
                {
                    user: {name: "user3"},
                    authorized_keys: [{name: "user1"}, {name: "user3"}]
                }
            ],
            includes: {
                groupCategories: ["groupcat1", "groupcat2"],
                userCategories: ['cat1']
            },
            groups: [
                {
                    group: {name: "group1"},
                    members: ["user1", "user2", "user3"]
                },
                {
                    group: {name: "group2"},
                    members: ["user2"]
                }
            ]
        }
    ];

    var provider = new Provider();
    var loader = new Loader(provider);
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.userManager.userCategories.loadFromJson(userCategories);
    provider.managers.groupManager.groupCategories.load(groupCategories);
    loader.loadHosts(hosts);


    it("should return an collection of valid hosts including de-duplicated group categories", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        user: {name: "userA", state: "present"},
                        authorized_keys: [{name: "user1",state:"present"}]
                    },
                    {
                        user: {name: "user3", state: "present"},
                        authorized_keys: [{name: "user1",state:"present"},
                            {name: "user3",state:"present"}]
                    }
                ],
                groups: [
                    {
                        group: {name: "group1", state: "present"},
                        members: ["user1", "user3"]
                    },
                    {
                        group: {name: "group2", state: "present"}
                    }
                ],
                includes: {
                    userCategories: ["cat1"],
                    groupCategories: ["groupcat1", "groupcat2"]

                }
            }
        ];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });

    it('should not duplicate groups in groupCategories and groups controllers', () => {
        expect(provider.managers.groupManager.getGroups(provider.managers.hostManager.find("web01.example.co.za")).length).to.equal(3);
    });

    it('should expand group members to include user from user categories ' +
        ' that are members of a group category members array',  () =>{
        expect(provider.managers.groupManager.findHostGroupByName(provider.managers.hostManager.find("web01.example.co.za"),"group2")
            .members.length)
            .to.equal(1);
    });
});