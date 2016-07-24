import Provider from "../../src/Provider.js";
import User from "../../src/modules/user/User";
import UserAccount from "../../src/modules/user/UserAccount";
import Host from "../../src/modules/host/Host";
import Group from "../../src/modules/group/Group";
import {expect} from 'chai';
import Docker from './../support/Docker';
import AppUser from '../../src/ui/AppUser';


describe("validating host configuration", function () {

    var validUsers = [
        new User({name: 'user1', key: './conf-example/db/keys/user1.pub', state: 'present', uid: undefined}),
        new User({name: 'user2', key: undefined, state: 'absent', uid: undefined}),
        new User({name: 'user3', key: './conf-example/db/keys/user3.pub', uid: 1000, state: 'present'}),
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
            configGroup: "default",
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
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup: "default",
            users: [
                {
                    user: {name: "user1"}
                }
            ],
            groups: [
                {
                    group: {name: "group1"},
                    members: "user1"
                }
            ]
        },
        {
            name: "missing.owner.com",
            group: "sysadmin",
            permissions: 770,
            configGroup: "default",
            users: [
                {
                    user: {name: "user1"}
                }
            ],
            groups: [
                {
                    group: {name: "group1"},
                    members: "user1"
                }
            ]
        },
        {
            name: "missing.group.com",
            owner: "einstein",
            permissions: 770,
            configGroup: "default",
            users: [
                {
                    user: {name: "user1"}
                }
            ],
            groups: [
                {
                    group: {name: "group1"},
                    members: "user1"
                }
            ]
        },
        {
            name: "missing.permissions.com",
            owner: "einstein",
            group: "sysadmin",
            configGroup: "default",
            users: [
                {
                    user: {name: "user1"}
                }
            ],
            groups: [
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
            configGroup: "default",
            users: [
                {
                    user: {name: "waldo"},
                    authorized_keys: [{name: "user1"}]
                },
                {
                    user: {name: "user2", state: "present"},
                    authorized_keys: [{name: "user1"}]
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
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup: "default",
            users: [
                {
                    user: {name: "user1"},
                    authorized_keys: [
                        {name: "user1", state: "present"},
                        {name: "user3", state: "absent"},
                        {name: "waldo"},
                        {name: "user4"}
                    ],
                    become: true,
                    becomeUser: "newton"
                },
                {
                    user: {name: "user2"},
                    authorized_keys: [
                        {name: "user1"},
                        {name: "user4"}
                    ],
                    become: true
                }
            ],
            groups: [
                {
                    group: {name: "group10"},
                    members: [
                        "user2"
                    ],
                    become: true,
                    becomeUser: "newton"
                },
                {
                    group: {name: "group3"},
                    members: [
                        "waldo",
                        "user2"
                    ],
                    become: true
                },
                {
                    group: {name: "group2"},
                    members: [
                        "user2"
                    ],
                    become: true,
                    becomeUser: "newton"
                }
            ]
        }
    ];

    let provider = new Provider();
    //inject mocks
    let appUser = new AppUser("einstein", ["sysadmin"]);
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);

    it("should detect hosts without a name property", function () {
        expect(provider.managers.hostManager.errors.manager.indexOf("Error loading host - Could not create host  - The parameter data must be a hostname " +
            "or an object with a mandatory property \"name\".")).not.to.equal(-1);
    });

    it("should detect hosts without an owner property", function () {
        expect(provider.managers.hostManager.errors.manager.indexOf("Error loading host - Could not create host missing.owner.com - Owner must be a username or object of type User.")).not.to.equal(-1);
    });


    it("should detect hosts without a group property", function () {
        expect(provider.managers.hostManager.errors.manager.indexOf("Error loading host - Could not create host missing.group.com - Group must be a string.")).not.to.equal(-1);
    });


    it("should detect hosts without a permissions property", function () {
        let host = provider.managers.hostManager.findValidHost("missing.permissions.com", "default");
        expect(host.permissions).to.equal(parseInt("660", 8));
    });+


    it("should detect undefined users", function () {
        expect(provider.managers.hostManager.errors["www.test.com"].get("default").indexOf("Error adding host user - The user waldo does not exist " +
            "in valid users.")).not.to.equal(-1);
    });

    it("should detect group members that are undefined for host", function () {
        expect(provider.managers.hostManager.errors["www.test.com"].get("default").indexOf("There was an error adding members to the " +
            "group group2. Cannot add member to group. Parameter user with name user2 is not a valid user or user " +
            "is absent.")).not.to.equal(-1);
    });

    it("should detect undefined groups", function () {
        expect(provider.managers.hostManager.errors["www.abc.co.za"].get("default").indexOf("Error adding host group - The group group10 does " +
            "not exist in valid groups.")).not.to.equal(-1);
    });

    it("should detect undefined user in users authorized_keys list", function () {
        expect(provider.managers.hostManager.errors["www.abc.co.za"].get("default").indexOf("User with name waldo cannot be added as authorized " +
            "user to user1 as the user is invalid.")).not.to.equal(-1);
    });

    it("should detect defined user with missing key in user's authorized_keys list", function () {
        expect(provider.managers.hostManager.errors["www.abc.co.za"].get("default").indexOf("There was an error adding an authorised key to the " +
            "user user1. The user user4 is not in validUsers or does not have a " +
            "public key defined.")).not.to.equal(-1);
    });

    it("should detect a UserAccount which has itself in it's authorized_keys list", function () {
        expect(provider.managers.hostManager.errors["www.example.com"].get("default").indexOf("UserAccount user1 cannot be added to itself as an authorized user.")).not.to.equal(-1);
    });

    it("should load become and becomeUser settings correctly for user", ()=> {
        let host = provider.managers.hostManager.findValidHost("www.abc.co.za", "default");
        let ua = provider.managers.userManager.findUserAccountForHost(host, "user1");
        expect(ua.become).to.equal.true;
        expect(ua.becomeUser).to.equal("newton");
        ua = provider.managers.userManager.findUserAccountForHost(host, "user2");
        expect(ua.become).to.equal.true;
        expect(ua.becomeUser).to.be.undefined;
    });

    it("should load become and becomeUser settings correctly for group", ()=> {
        let host = provider.managers.hostManager.findValidHost("www.abc.co.za", "default");
        let hg = provider.managers.groupManager.findHostGroup(host, "group2");
        expect(hg.become).to.equal.true;
        expect(hg.becomeUser).to.equal("newton");
        hg = provider.managers.groupManager.findHostGroup(host, "group3");
        expect(hg.become).to.equal.true;
        expect(hg.becomeUser).to.be.undefined;
    });


    it("should return an array of valid hosts", function () {
        var validHosts = [
            {
                name: "www.example.com",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                configGroup: "default",
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

                ]
            },
            {
                "name": "missing.permissions.com",
                "owner": "einstein",
                "group": "sysadmin",
                "permissions": 660,
                "configGroup": "default",
                "users": [
                    {
                        "user": {
                            "name": "user1",
                            "state": "present"
                        }
                    }
                ]
            },
            {
                name: "www.test.com",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                configGroup: "default",
                users: [
                    {
                        user: {name: "user2", state: "absent"}
                    },
                    {
                        user: {name: "user3", state: "present"}
                    },
                    {
                        user: {name: "user4", state: "absent"}
                    }
                ],
                groups: [
                    {
                        group: {name: "group2", state: "present"}
                    },
                    {
                        group: {name: "group3", state: "present"}
                    }
                ]
            },
            {
                name: "www.abc.co.za",
                owner: "einstein",
                group: "sysadmin",
                permissions: 770,
                configGroup: "default",
                users: [
                    {
                        user: {name: "user1", state: "present"},
                        authorized_keys: [{name: "user3", state: "absent"}],
                        become: true,
                        becomeUser: "newton"
                    },
                    {
                        user: {name: "user2", state: "absent"},
                        become: true
                    }
                ],
                groups: [
                    {
                        group: {name: "group3", state: "present"},
                        become: true
                    }, {
                        group: {name: "group2", state: "present"},
                        become: true,
                        becomeUser: "newton"
                    }
                ]
            }
        ];
        expect(provider.managers.hostManager.export()).to.deep.equal(validHosts);
    });

    it("should generate a valid playbook", function (done) {
        let docker = new Docker();
        let running = false;
        var gen = provider.engine;
        this.timeout(20000);
        let host = {};
        docker.startDocker("vincentsshpasswd").then(ipaddr=> {
            running = true;
            host = new Host(provider, ipaddr, 'einstein', 'sysadmin', 770, "default");
            provider.managers.hostManager.addHost(host);
            let data = {user: provider.managers.userManager.validUsers[0]};
            let userAccount = new UserAccount(provider, data);
            provider.managers.userManager.addUserAccountToHost(host, userAccount);
            gen.loadEngineDefinition(host, appUser);
            return host;
        }).then(host=> {
            return gen.export(host, appUser);
        }).then((result)=> {
            return gen.runPlaybook(host, false, null, 'vincent', 'pass');
        }).then(result=> {
            //console.log(result);
            expect(result.includes('ok=2    changed=1')).to.be.true;
        }).then(result => {
            return docker.stopDocker();
        }).then(result=> {
            gen.clean();
            done();
        }).catch(e=> {
            if (running) {
                docker.stopDocker().then(console.log(e));
            } else {
                console.log(e);
            }
            done(e);
        });
    });
});