'use strict';

jest.dontMock('../src/modules/base');

var groups = [
    {name: 'group1'},
    {name: 'group2'},
    {name: 'group2'},
    {name: 'group3', gid: 1000},
    {name: 'group4', gid: 1000},
    {}
];
var users = [
    {name: 'user1', key: 'user1.pub', state: 'present'},
    {name: 'user2', key: '', state: 'absent'},
    {name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'},
    {name: 'user4', state: 'absent'},
    {name: 'user5', state: 'deleted'},
    {name: 'user2'},
    {uid: 2000},
    {name: 'user6', state: 'present', uid: 1000}
];
var hosts = [
    {
        name: "www.example.com",
        users: [
            {
                name: "user1",
                authorized_keys: ["user1"]
            },
            {
                name: "user2",
                authorized_keys: ["user1"]
            }
        ],
        groups: [
            {
                name: "group1",
                members: [
                    "user1"
                ]
            },
            {
                name: "group2",
                members: [
                    "user2"
                ]
            },
            {
                name: "group3",
                members: [
                    "user1",
                    "user2"
                ]
            }

        ]
    }, {
        //name: missing
        users: [
            {
                name: "user1"
            }
        ],
        group: [
            {
                name: "group1",
                members: "user1"
            }
        ]
    },
    {
        name: "www.test.com",
        users: [
            {
                name: "waldo",
                authorized_keys: ["user1"]
            },
            {
                name: "user2",
                authorized_keys: ["user1"]
            }
        ],
        groups: [
            {
                name: "group2",
                members: [
                    "user2"
                ]
            },
            {
                name: "group3",
                members: [
                    "waldo",
                    "user2"
                ]
            }

        ]
    },
    {
        name: "www.abc.co.za",
        users: [
            {
                name: "user1",
                authorized_keys: ["user1", "user3","waldo","user4"]
            },
            {
                name: "user2",
                authorized_keys: ["user1", "user4"]
            }
        ],
        groups: [
            {
                name: "group10",
                members: [
                    "user2"
                ]
            },
            {
                name: "group3",
                members: [
                    "waldo",
                    "user2"
                ]
            }

        ]
    }
];
var Base = require('../src/modules/base').default;

describe("validating group configuration", function () {
    var base = new Base(users,groups,hosts);
    var parsedGroups = base.validateGroups();

    it("should detect duplicate group names", function () {
        expect(base.errors.indexOf("Group group2 has already been defined.")).not.toBe(-1);
    });

    it("should detect duplicate gids", function () {
        expect(base.errors.indexOf("Gid 1000 for group4 has already been assigned.")).not.toBe(-1);
    });

    it("should detect groups with missing name property", function () {
        expect(base.errors.indexOf("Group with index 5 is missing a name property.")).not.toBe(-1);
    })

    it("should return an array of valid groups", function () {
        var validGroups = [
            {name: 'group1'},
            {name: 'group2'},
            {name: 'group3', gid: 1000}
        ];
        expect(parsedGroups).toEqual(validGroups);
    });

});

describe("validating user configuration", function () {
    var base = new Base(users,groups,hosts);
    var parsedUsers = base.validateUsers();
    it("should detect duplicate user names", function () {
        expect(base.errors.indexOf("User user2 has already been defined.")).not.toBe(-1);
    });

    it("should detect duplicate uids", function () {
        expect(base.errors.indexOf("Uid 1000 from user6 has already been assigned.")).not.toBe(-1);
    });

    it("should return an array of valid users", function () {
        var validUsers = [
            {name: 'user1', key: 'user1.pub', state: 'present'},
            {name: 'user2', key: '', state: 'absent'},
            {name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'},
            {name: 'user4', state: 'absent'}
        ];
        expect(parsedUsers).toEqual(validUsers);
    });

});

describe("validating host configuration", function () {
    var validUsers = [
        {name: 'user1', key: 'user1.pub', state: 'present'},
        {name: 'user2', key: '', state: 'absent'},
        {name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'},
        {name: 'user4', state: 'absent'}
    ];

    var validGroups = [
        {name: 'group1'},
        {name: 'group2'},
        {name: 'group3', gid: 1000}
    ];

    var base = new Base(users,groups,hosts);
    var parsedHosts = base.validateHosts(validUsers, validGroups);

    it("should detect hosts without a name property", function () {
        expect(base.errors.indexOf("Host with index 1 is missing a name property.")).not.toBe(-1);
    });

    it("should detect undefined users", function () {
        expect(base.errors.indexOf("User waldo for www.test.com is not defined in the user config file.")).not.toBe(-1);
    });

    it("should detect group members that are undefined for host", function () {
        expect(base.errors.indexOf("The member waldo of group group3 for host www.test.com has not been defined.")).not.toBe(-1);
    });

    it("should detect undefined groups", function () {
        expect(base.errors.indexOf("The group group10 for host www.abc.co.za has not been defined.")).not.toBe(-1);
    });

    it("should detect undefined user in users authorized_keys list", function () {
        expect(base.errors.indexOf("The authorized user waldo for user1 for www.abc.co.za has not been defined.")).not.toBe(-1);
    });

    it("should detect defined user with missing key in user's authorized_keys list", function () {
        expect(base.errors.indexOf("The authorized user user4 for user1 for www.abc.co.za does not have a key defined.")).not.toBe(-1);
    });

    it("should return an array of valid hosts", function () {
        var validHosts = [
            {
                name: "www.example.com",
                users: [
                    {
                        name: "user1",
                        state: "present",
                        authorized_keys: ["user1"]
                    },
                    {
                        name: "user2",
                        state: "absent",
                    }
                ],
                groups: [
                    {
                        name: "group1",
                        members: [
                            "user1"
                        ]
                    },
                    {
                        name: "group2",
                        members: []
                    },
                    {
                        name: "group3",
                        members: ["user1"]
                    }
                ]
            },
            {
                name: "www.test.com",
                users: [
                    {
                        name: "user2",
                        state:"absent",
                    }
                ],
                groups: [
                    {
                        name: "group2",
                        members: []
                    },
                    {
                        name: "group3",
                        members: []
                    }

                ]
            },
            {
                name: "www.abc.co.za",
                users: [
                    {
                        name: "user1",
                        state: "present",
                        authorized_keys: ["user1", "user3"]
                    },
                    {
                        name: "user2",
                        state: "absent",
                    }
                ],
                groups: [
                    {
                        name: "group3",
                        members: []
                    }

                ]
            }
        ];
        expect(parsedHosts).toEqual(validHosts);
    });

});