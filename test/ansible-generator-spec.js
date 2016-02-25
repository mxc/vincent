/**
 * Created by mark on 2016/02/21.
 */
import Provider from "../src/Provider.js";
import User from "../src/coremodel/User";
import Group from "../src/coremodel/Group";
//import Loader from '../src/utilities/Loader ';
import AnsibleGenerator from "../src/modules/AnsibleGenerator";
var Loader = require('../src/utilities/Loader').default;

var gen = new AnsibleGenerator();


describe("testing of yaml generator", function () {
    "use strict";

    var validUsers = [
        new User({name: 'userA', key: 'userA.pub', state: 'present', uid: undefined}),
        new User({name: 'userB', key: undefined, state: 'absent', uid: undefined}),
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

    var validHosts = [
        {
            name: "www.example.com",
            users: [
                {
                    user: {name: "userA", state: "present"},
                    authorized_keys: [{name:"userA", state:"present"}]
                },
                {
                    user: {name: "userB", state: "absent"},
                    authorized_keys: [{name:"userA", state:"present"}]
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
        }];

    var yml="";

    var provider = new Provider();
    //inject mocks
    provider.groups.validGroups = validGroups;
    provider.users.validUsers = validUsers;
    var loader = new Loader(provider);
    loader.loadHosts(validHosts);

    it("should write to the console", function () {
        gen.generate(provider.hosts.find("www.example.com"));
    });
})



