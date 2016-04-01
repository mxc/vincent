/**
 * Created by mark on 2016/02/29.
 */
import Provider from "../src/Provider.js";
import User from "../src/modules/user/User";
import Group from "../src/modules/group/Group";
import Loader from '../src/utilities/FileDbLoader';

describe("HostManager configuration without remote access definition", ()=> {
    "use strict";
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
        }];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    var loader = new Loader(provider);
    loader.loadHosts(hosts);
    let host = provider.managers.hostManager.find("www.example.com");

    it("should set remote access user to 'same'", ()=> {
        expect(host.remoteAccess.remoteUser).to.equal("same");
    });

    it("should set remote access authentication to 'publicKey'", ()=> {
        expect(host.remoteAccess.authentication).to.equal("publicKey");
    });

    it("should set remote access sudo authentication to false", ()=> {
        expect(host.remoteAccess.sudoAuthentication).to.equal(false);
    });

    it("should not addValidGroup definition to model export", ()=> {
        expect(host.export().remoteAccess).to.equal(undefined);
    })
});


describe("HostManager configuration with remote access definition", ()=> {
    "use strict";
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
            remoteAccess: {
                remoteUser: "mark",
                authentication: "publicKey"
            },
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
        }];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    var loader = new Loader(provider);
    loader.loadHosts(hosts);
    let host = provider.managers.hostManager.find("www.example.com");

    it("should set remote access user to 'same'", ()=> {
        expect(host.remoteAccess.remoteUser).to.equal("mark");
    });

    it("should set remote access authentication to 'publicKey'", ()=> {
        expect(host.remoteAccess.authentication).to.equal("publicKey");
    });

    it("should set remote access sudo authentication to false", ()=> {
        expect(host.remoteAccess.sudoAuthentication).to.equal(false);
    });

    it("should not addValidGroup definition to model export", ()=> {
        expect(host.export().remoteAccess).to.deep.equal({
            remoteUser: "mark",
            authentication: "publicKey",
            sudoAuthentication: false,
        });
    })
});

describe("HostManager configuration with invalid remote access definition", ()=> {
    "use strict";
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
            remoteAccess: {
                remoteUser: "peter",
                authentication: "passwd",
                sudoAuthentication: "unknown"
            },
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
        }];

    var provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    var loader = new Loader(provider);
    loader.loadHosts(hosts);
    it("should log errors", ()=> {
        expect(loader.errors.indexOf("Error adding remote access user - Invalid " +
            "configuration settings provided for RemoteAccess object./n/r" +
            "Authentication must be either 'password' or 'publicKey'./n/r" +
            "Error: Boolean value must be 'true/yes' or 'false/no'/n/r" +
            "sudoAuthentication must be a boolean value."
        )).not.to.equal(-1);
    });

});