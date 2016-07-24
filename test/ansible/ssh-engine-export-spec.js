/**
 * Created by mark on 2016/07/24.
 */

"use strict";

import Provider from './../../src/Provider';
import {expect} from 'chai';
import HostSsh from  './../../src/modules/ssh/HostSsh';
import User from  './../../src/modules/user/User';
import Group from  './../../src/modules/group/Group';
import AppUser from  './../../src/ui/AppUser';

describe("SSH Engine export should", function () {

    let provider = new Provider();

    it("allow for the creation of a Host object with a defined data structure", ()=> {

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

        var host = {
            name: "www.example.co.za",
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

            ],
            configs: {
                ssh: {
                    permitRoot: false,
                    passwordAuthentication: false,
                    validUsersOnly: false
                }
            }
        };

        let provider = new Provider();
        //inject mocks
        let appUser = new AppUser("einstein", ["sysadmin"]);
        
        provider.managers.groupManager.validGroups = validGroups;
        provider.managers.userManager.validUsers = validUsers;
        provider.managers.hostManager.loadFromJson(host);

        let host1 = provider.managers.hostManager.findValidHost("www.example.co.za", "default");
        provider.managers.sshManager.addValidUser(host1, "user1");
        let tasks = [];
        provider.managers.sshManager.exportToEngine("ansible",host1,tasks);
        let tresult = [ { name: 'Ssh config PermitRoot state check',
            lineinfile:
            { dest: '/etc/ssh/sshd_config',
                regexp: '^PermitRootLogin yes|^PermitRootLogin no|^#PermitRootLogin yes',
                line: 'PermitRootLogin false' } },
            { name: 'Ssh config PermitPassword state check',
                lineinfile:
                { dest: '/etc/ssh/sshd_config',
                    regexp: 'PasswordAuthentication yes|PasswordAuthentication no',
                    line: 'PasswordAuthentication false' } } ];
        expect(tasks).to.deep.equal(tresult);

    });

});