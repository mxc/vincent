import Provider from "../src/Provider.js";
import User from "../src/coremodel/User";
import Group from "../src/coremodel/Group";
//import Loader from '../src/utilities/Loader ';
var Loader = require('../src/utilities/Loader').default;


describe("validating host configuration", function () {

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
                    authorized_keys: [{ name:"user1", state: "present"}]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [
                        { name:"user1", state: "present"},
                        { name:"user2", state: "absent"}
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
            users: [
                {
                    user: {name: "waldo"},
                    authorized_keys: [{name:"user1"}]
                },
                {
                    user: {name: "user2", state: "present"},
                    authorized_keys: [{name:"user1"}]
                },
                {
                    user: {name: "user3"}
                },
                {
                    user: {name: "user4", state: "absent"}
                }
            ],
            groups: [
                {
                    group: {name: "group2"},
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
        },
        {
            name: "www.abc.co.za",
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [{name:"user1"}, {name:"user3"}, {name:"waldo"}, {name:"user4"}]
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [{name:"user1"}, {name:"user4"}]
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

    var provider = new Provider();
    //inject mocks
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;

    var loader = new Loader(provider);
    loader.loadHosts(hosts);

    it("should detect hosts without a name property", function () {
        expect(loader.errors.indexOf("Error adding host - The parameter data must be a hostname " +
            "or an object with a mandatory property \"name\".")).not.to.equal(-1);
    });

    it("should detect undefined users", function () {
        expect(loader.errors.indexOf("Error adding host user - The user waldo does not exist " +
            "in valid users.")).not.to.equal(-1);
    });

    it("should detect group members that are undefined for host", function () {
        expect(loader.errors.indexOf("Error adding host user - The user waldo does not exist " +
            "in valid users.")).not.to.equal(-1);
    });

    it("should detect undefined groups", function () {
        expect(loader.errors.indexOf("Error adding host group - The group group10 does " +
            "not exist in valid groups.")).not.to.equal(-1);
    });

    it("should detect undefined user in users authorized_keys list", function () {
        expect(loader.errors.indexOf("User with name waldo cannot be added as authorized " +
            "user to user1 as the user is invalid.")).not.to.equal(-1);
    });

    it("should detect defined user with missing key in user's authorized_keys list", function () {
        expect(loader.errors.indexOf("There was an error adding an authorised key to the " +
            "user user1. The user user4 is not in validUsers, is absent or does not have an " +
            "public key defined")).not.to.equal(-1);
    });

    it("should return an array of valid hosts", function () {
        var validHosts = [
            {
                name: "www.example.com",
                users: [
                    {
                        user: {name: "user1", state: "present" },
                        authorized_keys: [{ name:"user1", state: "present"}]
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
                        members: []
                    },
                    {
                        group: {name: "group3", state: "present"},
                        members: [
                            "user1"
                        ]
                    }

                ]
            },
            {
                name: "www.test.com",
                users: [
                    {
                        user: {name: "user2", state: "absent"},
                        authorized_keys: [{name:"user1"}]
                    },
                    {
                        user: {name: "user3", state: "present"},
                        authorized_keys:[]
                    },
                    {
                        user: {name: "user4", state: "absent"},
                        authorized_keys:[]
                    }
                ],
                groups: [
                    {
                        group: {name: "group2", state: "present"},
                        members: []
                    },
                    {
                        group: {name: "group3", state: "present"},
                        members: []
                    }
                ]
            },
            {
                name: "www.abc.co.za",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: [{name:"user1"}, {name:"user3", state:"absent"}]
                    },
                    {
                        user: {name: "user2", state: "absent"},
                    }
                ],
                groups: [
                    {
                        group: {name: "group3", state: "present"},
                        members: []
                    }

                ]
            }
        ];
        expect(JSON.stringify(provider.hosts.export())).to.eql(JSON.stringify(validHosts));
    });
});