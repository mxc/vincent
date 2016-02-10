
'use strict';
jest.dontMock('../src/modules/base');
var Base = require('../src/modules/base').default;
describe("validating ssh config include", function () {

    var validUsers = [
        {
            name: "user1",
            key: "user1.pub",
            uid: 1100,
            state: "present"
        },
        {
            name: "user2",
            key: "user2.pub",
            uid: 1200,
            state: "present"
        }
    ];

    var validGroups = [
        {name: "group1", gid: 1000},
        {name: "group2", gid: 2000},
        {name: "group3"}
    ];

    var sshConfigs = {
        strict: {
            permit_root: "no",
            valid_users_only: "true",
            password_authentication: "no"
        },
        strict_with_root: {
            permit_root: "without-password",
            valid_users_only: "true",
            password_authentication: "no"
        },
        loose: {
            permit_root: "yes",
            valid_users_only: "false",
            password_authentication: "yes"
        }
    };

    var hosts = [
        {
            name: "web01.example.co.za",
            users: [
                {
                    name: "user1",
                    authorized_keys: ["user1", "user2"]
                }, {
                    name: "user2",
                    authorized_keys: ["user2"]
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
            ],
            include_ssh_config: "strict"
        }
    ];

    var base = new Base(validUsers, validGroups, hosts);
    base.setSSHConfigs(sshConfigs);

    var parsedHosts = base.validateHosts(validUsers, validGroups);

    it("should return an collection of valid hosts including ssh configs", function () {
        var validHosts = [
            {
                name: "web01.example.co.za",
                users: [
                    {
                        name: "user1",
                        state: "present",
                        authorized_keys: ["user1", "user2"]
                    }, {
                        name: "user2",
                        state: "present",
                        authorized_keys: ["user2"]
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
                ],
                ssh: {
                    permit_root: "no",
                    valid_users_only: "true",
                    password_authentication: "no"
                }
            }
        ];
        expect(parsedHosts).toEqual(validHosts);
    });
});


describe("validating user categories include", function () {

    var validUsers = [
        {
            name: "user1",
            key: "user1.pub",
            uid: 1100,
            state: "present"
        },
        {
            name: "user2",
            key: "user2.pub",
            uid: 1200,
            state: "present"
        },
        {
            name: "user3",
            state: "absent"
        },
        {
            name: "userA",
            state: "present"
        }
    ];

    var validGroups = [
        {name: "group1", gid: 1000},
        {name: "group2", gid: 2000},
        {name: "group3"}
    ];

    var userCategories = {
        cat1: [
            {name: "user1", authorized_keys: ["user1"]},
            {name: "user2", authorized_keys: ["user2", "user1"]}
        ],
        cat2: [
            {name: "user3", authorized_keys: ["user2", "user3"]},
            {name: "user1"}
        ]
    };

    var hosts = [
        {
            name: "web01.example.co.za",
            users: [
                {
                    name: "userA",
                    authorized_keys: ["user1", "user2"]
                }
            ],
            include_user_categories: [
                "cat1", "cat2"
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
            ],
        }
    ];

    var base = new Base(validUsers, validGroups, hosts);
    base.setUserCategories(userCategories);
    base.parsedUsers = validUsers;
    var parsedHosts = base.validateHosts(validUsers, validGroups);

    it("should return an collection of valid hosts including ssh configs", function () {
        var validHosts = [
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
        expect(parsedHosts).toEqual(validHosts);
    });
});

describe("validating group categories include", function () {

    var validUsers = [
        {
            name: "user1",
            key: "user1.pub",
            uid: 1100,
            state: "present"
        },
        {
            name: "user2",
            key: "user2.pub",
            uid: 1200,
            state: "present"
        },
        {
            name: "user3",
            state: "absent"
        },
        {
            name: "userA",
            state: "present"
        }
    ];

    var validGroups = [
        {name: "group1", gid: 1000},
        {name: "group2", gid: 2000},
        {name: "group3"}
    ];

    var userCategories = {
        cat1: [
            {name: "user1", authorized_keys: ["user1"]},
            {name: "user2", authorized_keys: ["user2", "user1"]}
        ],
        cat2: [
            {name: "user3", authorized_keys: ["user2", "user3"]},
            {name: "user1"}
        ]
    };

    var groupCategories = {
        groupCat1: [
            {name: "group4", members: ["user1"]},
            {name: "group5", members: ["user2", "user1"]}
        ],
        groupCat2: [
            {name: "group6", members: ["user"]},
            {name: "group7", memebers: ["cat1"]}
        ]
    };

    var hosts = [
        {
            name: "web01.example.co.za",
            users: [
                {
                    name: "userA",
                    authorized_keys: ["user1", "user2"]
                }
            ],
            
            include_user_categories: [ "cat1", "cat2"],
            
            groups: [
                {
                    name: "group1",
                    members: ["user1", "user2", "user3"]
                },
                {
                    name: "group2",
                    members: ["user2"]
                }
            ],
            
            include_group_categories: ["groupcat1","groupcat2"]
        }
    ];

    var base = new Base(validUsers, validGroups, hosts);
    base.setGroupCategories(groupCategories);
    base.setUserCategories(userCategories);
    base.parsedUsers = validUsers;
    var parsedHosts = base.validateHosts(validUsers, validGroups);

    it("should return an collection of valid hosts including group categories", function () {
        var validHosts = [
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
        expect(parsedHosts).toEqual(validHosts);
    });
});