'use strict';

jest.dontMock('../src/App');

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
                authorized_keys: ["user1", "user3"]
            },
            {
                name: "user2",
                authorized_keys: ["user1", "waldo", "user4"]
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
var App = require('../src/App').default;

describe("validating group configuration", function () {
    var app = new App(groups, users, hosts);
    var parsedGroups = app.validateGroups();

    it("should detect duplicate group names", function () {
        expect(app.errors.indexOf("Group group2 has already been defined.")).not.toBe(-1);
    });

    it("should detect duplicate gids", function () {
        expect(app.errors.indexOf("Gid 1000 for group4 has already been assigned.")).not.toBe(-1);
    });

    it("should detect groups with missing name property", function () {
        expect(app.errors.indexOf("Group with index 5 is missing a name property.")).not.toBe(-1);
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
    var app = new App(groups, users, hosts);
    var parsedUsers = app.validateUsers();
    it("should detect duplicate user names", function () {
        expect(app.errors.indexOf("User user2 has already been defined.")).not.toBe(-1);
    });

    it("should detect duplicate uids", function () {
        expect(app.errors.indexOf("Uid 1000 from user6 has already been assigned.")).not.toBe(-1);
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

    var app = new App(groups, users, hosts);
    var parsedHosts = app.validateHosts(validUsers, validGroups);

    it("should detect hosts without a name property", function () {
        expect(app.errors.indexOf("Host with index 1 is missing a name property.")).not.toBe(-1);
    });

    it("should detect undefined users", function () {
        expect(app.errors.indexOf("User waldo for www.test.com is not defined in the user config file.")).not.toBe(-1);
    });

    it("should detect group members that are undefined for host", function () {
        expect(app.errors.indexOf("The member waldo of group group3 for host www.test.com has not been defined.")).not.toBe(-1);
    });

    it("should detect undefined groups", function () {
        expect(app.errors.indexOf("The group group10 for host www.abc.co.za has not been defined.")).not.toBe(-1);
    });

    it("should detect undefined user in users authorized_keys list", function () {
        expect(app.errors.indexOf("The authorized user waldo for user2 for www.abc.co.za has not been defined.")).not.toBe(-1);
    });

    it("should detect defined user with missing key in user's authorized_keys list", function () {
        expect(app.errors.indexOf("The authorized user user4 for user2 for www.abc.co.za does not have a key defined.")).not.toBe(-1);
    });

    it("should return an array of valid hosts", function () {
        var validHosts = [
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
            },
            {
                name: "www.test.com",
                users: [
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
                        authorized_keys: ["user1", "user3"]
                    },
                    {
                        name: "user2",
                        authorized_keys: ["user1"]
                    }
                ],
                groups: [
                    {
                        name: "group3",
                        members: [
                            "user2"
                        ]
                    }

                ]
            }
        ];
        expect(parsedHosts).toEqual(validHosts);
    });

});