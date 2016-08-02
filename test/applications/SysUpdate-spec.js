/**
 * Created by mark on 2016/07/25.
 */
import Provider from '../../src/Provider';
import {expect} from 'chai';
import AppUser from '../../src/ui/AppUser';
import HostManagerUI from '../../src/modules/host/ui/console/HostManager';
import SSHManagerUI from '../../src/modules/ssh/ui/console/SSHManager';
import Vincent from '../../src/Vincent';
import Session from '../../src/ui/Session';
import Debian from '../../src/modules/applications/systemupdate/Debian';
import Redhat from '../../src/modules/applications/systemupdate/Redhat';
import User from '../../src/modules/user/User';
import Group from '../../src/modules/group/Group';


describe("SysUpdate should", ()=> {

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


    it("allow for system update instances to be added to a host", ()=> {

        var host = {
            name: "www.example.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup: "default",
            osFamily: "Debian",
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
        };

        let provider = new Provider();
        //inject mocks
        provider.managers.groupManager.validGroups = validGroups;
        provider.managers.userManager.validUsers = validUsers;
        provider.managers.hostManager.loadFromJson(host);

        let thost = provider.managers.hostManager.findValidHost(host.name, host.configGroup);
        // let sysup = new Debian(provider, {
        //     updateCache: true,
        //     upgrade: true,
        //     autoremove: true
        // });


        provider.managers.systemUpdateManager.addConfigToHost(thost);
        let sysup = thost.getConfig("systemUpdate");
        expect(sysup.upgrade).to.equal("yes");
        expect(sysup.autoremove).to.equal("no");
        expect(sysup.updateCache).to.equal("no");
    });


    // it("should throw an error when an incorrect system update type is added to a host", ()=> {
    //     var host = {
    //         name: "www.example.com",
    //         owner: "einstein",
    //         group: "sysadmin",
    //         permissions: 770,
    //         configGroup: "default",
    //         osFamily: "Debian",
    //         users: [
    //             {
    //                 user: {name: "user1"},
    //                 authorized_keys: [{name: "user1", state: "present"}]
    //             },
    //             {
    //                 user: {name: "user2"},
    //                 authorized_keys: [
    //                     {name: "user1", state: "present"},
    //                     {name: "user2", state: "absent"}
    //                 ]
    //             }
    //         ],
    //         groups: [
    //             {
    //                 group: {name: "group1"},
    //                 members: [
    //                     "user1"
    //                 ]
    //             },
    //             {
    //                 group: {name: "group2"},
    //                 members: [
    //                     "user2"
    //                 ]
    //             },
    //             {
    //                 group: {name: "group3"},
    //                 members: [
    //                     "user1",
    //                     "user2"
    //                 ]
    //             }
    //
    //         ]
    //     };
    //
    //     let provider = new Provider();
    //     //inject mocks
    //     provider.managers.groupManager.validGroups = validGroups;
    //     provider.managers.userManager.validUsers = validUsers;
    //     provider.managers.hostManager.loadFromJson(host);
    //
    //     let thost = provider.managers.hostManager.findValidHost(host.name, host.configGroup);
    //     let sysup = new Redhat(provider, {
    //         updateCache: true,
    //         upgrade: true,
    //         autoremove: true
    //     });
    //     expect(()=> {
    //         provider.managers.systemUpdateManager.addSystemUpdateToHost(thost)
    //     }).to.throw("The host is os family is Debian. Redhat system update instance is not valid for this host.");
    // });

    it("load system update from host definition", ()=> {
        var host = {
            name: "www.example.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup: "default",
            osFamily: "Debian",
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

            ],
            configs: {
                systemUpdate: {
                    updateCache: "yes",
                    upgrade: "yes",
                    autoremove: "yes"
                }
            }
        };

        let provider = new Provider();
        //inject mocks
        let appUser = new AppUser("einstein", ["sysadmin"]);
        provider.managers.groupManager.validGroups = validGroups;
        provider.managers.userManager.validUsers = validUsers;
        provider.managers.hostManager.loadFromJson(host);
        let thost = provider.managers.hostManager.findValidHost(host.name, host.configGroup);
        expect(thost.getConfig("systemUpdate") instanceof Debian).to.be.true;
    });


    it("should export hosts correctly", ()=> {

        var host = {
            name: "www.example.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup: "default",
            osFamily: "Debian",
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
        };

        var expectedhost = {
            name: "www.example.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            configGroup: "default",
            osFamily: "Debian",
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

            ],
            configs: {
                systemUpdate: {
                    updateCache: "yes",
                    upgrade: "yes",
                    autoremove: "yes"
                }
            }
        };


        let provider = new Provider();
        //inject mocks
        provider.managers.groupManager.validGroups = validGroups;
        provider.managers.userManager.validUsers = validUsers;
        provider.managers.hostManager.loadFromJson(host);

        let thost = provider.managers.hostManager.findValidHost(host.name, host.configGroup);
        let sysup = provider.managers.systemUpdateManager.addConfigToHost(thost);
        sysup.autoremove=true;
        sysup.updateCache=true;
        sysup.upgrade=true;
        expect(thost.export()).to.deep.equal(expectedhost);
    });

});