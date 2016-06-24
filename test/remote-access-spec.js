/**
 * Created by mark on 2016/02/29.
 */
import Provider from "../src/Provider.js";
import User from "../src/modules/user/User";
import Group from "../src/modules/group/Group";
import {expect} from 'chai';
import AppUser from '../src/ui/AppUser';

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
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
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

    let provider = new Provider();
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);
    let host = provider.managers.hostManager.findValidHost("www.example.com");

    it("should set remote access user to 'same'", ()=> {
        expect(host.remoteAccess).to.equal(undefined);
    });
    //
    // it("should set remote access authentication to 'publicKey'", ()=> {
    //     expect(host.remoteAccess.authentication).to.equal(undefined);
    // });
    //
    // it("should set remote access sudo authentication to false", ()=> {
    //     expect(host.remoteAccess.sudoAuthentication).to.equal(undefined);
    // });
    //
    // it("should not add definition to model export", ()=> {
    //     expect(host.export().remoteAccess).to.equal(undefined);
    // })
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
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
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

    let provider = new Provider();
    // provider.init();    //inject mocks
    //inject mocks
    let appUser = new AppUser("einstien", ["sysadmin"]);
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);
    let host = provider.managers.hostManager.findValidHost("www.example.com");

    it("should set remote access user to 'same'", ()=> {
        expect(host.remoteAccess.remoteUser).to.equal("mark");
    });

    it("should set remote access authentication to 'publicKey'", ()=> {
        expect(host.remoteAccess.authentication).to.equal("publicKey");
    });

    it("should set remote access sudo authentication to false", ()=> {
        expect(host.remoteAccess.sudoAuthentication).to.equal(undefined);
    });

    it("should add definition to model export", ()=> {
        expect(host.export().remoteAccess).to.deep.equal({
            remoteUser: "mark",
            authentication: "publicKey"
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
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            remoteAccess: {
                remoteUser: "peter",
                authentication: "passwrd",
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

    let provider = new Provider();
    //provider.init();    //inject mocks
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);
    it("should log errors", ()=> {
        expect(provider.managers.hostManager.errors["www.example.com"][5]).to.equal("Error adding remote access user - Invalid " +
            "configuration settings provided for RemoteAccess object./n/r" +
            "Error: Authentication must be either 'password' or 'publicKey'./n/r" +
            "Error: sudoAuthentication must be a boolean value. Current value is unknown - Boolean value must be 'true/yes' or 'false/no'."
        );
        expect(provider.managers.hostManager.errors["www.example.com"].indexOf("Error adding remote access user - Invalid " +
            "configuration settings provided for RemoteAccess object./n/r" +
            "Error: Authentication must be either 'password' or 'publicKey'./n/r" +
            "Error: sudoAuthentication must be a boolean value. Current value is unknown - Boolean value must be 'true/yes' or 'false/no'."
        )).not.to.equal(-1);
    });

});