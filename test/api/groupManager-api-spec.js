/**
 * Created by mark on 2016/05/29.
 */
"use strict";

import Provider from './../../src/Provider';
import {expect} from 'chai';
import UserAccount from '../../src/modules/user/UserAccount';
import Host from '../../src/modules/host/Host';
import User from '../../src/modules/user/User';
import Group from '../../src/modules/group/Group';
import HostGroup from '../../src/modules/group/HostGroup';
import HostSudoEntry from '../../src/modules/sudo/HostSudoEntry';

describe("GroupManager API should", function () {

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
                },
                {
                    user: {name: "user4"},
                    authorized_keys: [{name: "user1"}]
                },
                {
                    user: {name: "user3", state: "present"}
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
                        "user4"
                    ]
                }
            ]
        },
        {
            name: "www.dogz.com",
            owner: "einstein",
            group: "sysadmin",
            permissions: 770,
            users: [
                {
                    user: {name: "user4"},
                    authorized_keys: [{name: "user1"}]
                },
                {
                    user: {name: "user3", state: "present"}
                },
                {
                    user: {name: "user4", state: "present"}
                }
            ],
            groups: [
                {
                    group: {name: "group2"},
                    members: [
                        "user3"
                    ]
                },
                {
                    group: {name: "group3"},
                    members: [
                        "user3",
                        "user4"
                    ]
                }
            ]
        }
    ];

    let provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(hosts);

    it("find valid groups by name or group object or gid", function () {
        let group = provider.managers.groupManager.findValidGroup("group1");
        expect(group).to.not.be.undefined;
        group = provider.managers.groupManager.findValidGroup(group);
        expect(group).to.not.be.undefined;
        group = provider.managers.groupManager.findValidGroupByGid(1000);
        expect(group).to.not.be.undefined;
        group = provider.managers.groupManager.findValidGroup("groupx");
        expect(group).to.be.undefined;
     });

    it("allow new groups to be added to valid groups",()=>{
        let group = new Group("groupx");
        provider.managers.groupManager.addValidGroup(group);
        expect(provider.managers.groupManager.findValidGroup(group)).to.deep.equal(group);
    });

    it("throw an error if  a group with the same name already exists in validGroups",()=>{
        let group = new Group("group1");
        let func = ()=>{
            provider.managers.groupManager.addValidGroup(group);
        };
        expect(func).to.throw();
    });

    it("throw an error if  a group with the same gid already exists in validGroups",()=>{
        let data = {
            name: "groupz",
            gid:1000,
            state:"present"
        };
        let group = new Group(data);
        let func = ()=>{
            provider.managers.groupManager.addValidGroup(group);
        };
        expect(func).to.throw("Group groupz with gid 1000 already exists as group3 with gid 1000.");
    });

    it("find all HostGroups that has a given user as a member",()=>{
        let hgs = provider.managers.groupManager.findHostGroupsWithUser("user1");
        expect(hgs.length).to.equal(1);
        let user = provider.managers.userManager.findValidUser("user4");
        hgs = provider.managers.groupManager.findHostGroupsWithUser(user);
        expect(hgs.length).to.equal(2);
    });

    it("find all Hosts that have a given groups as a HostGroup",()=>{
        let hosts = provider.managers.groupManager.findHostsWithGroup("group3");
        expect(hosts.length).to.equal(1);
        let group = provider.managers.groupManager.findValidGroup("group2");
        hosts = provider.managers.groupManager.findHostsWithGroup(group);
        expect(hosts.length).to.equal(2);
    });

    it("allow users to be removed from HostGroups",()=>{
        let host = provider.managers.hostManager.findValidHost("www.dogz.com");
        let hostGroups = provider.managers.groupManager.findHostGroupsWithUserForHost(host,"user3");
        expect(hostGroups.length).to.equal(2);
        provider.managers.groupManager.removeUserFromHostGroups(host,"user3")
         hostGroups = provider.managers.groupManager.findHostGroupsWithUserForHost(host,"user3");
        expect( hostGroups.length).to.equal(0);
    });

    it("mark all hostgroups as absent when group is marked absent",()=>{
        let host = provider.managers.hostManager.findValidHost("www.dogz.com");
        let group = provider.managers.groupManager.findValidGroup("group2");
        let hostGroups = provider.managers.groupManager.findAllHostGroupsForGroup("group2");
        expect(hostGroups[0].state).to.equal("present");
        expect(hostGroups[1].state).to.equal("present");
        expect(group.state).to.equal("present");
        provider.managers.groupManager.changeGroupStatus("group2","absent");
        expect(hostGroups[0].state).to.equal("absent");
        expect(hostGroups[1].state).to.equal("absent");
        expect(group.state).to.equal("absent");
    });

    it("allow groups to be deleted",()=>{
        provider.managers.groupManager.changeGroupStatus("group2","absent");
        let hostGroups = provider.managers.groupManager.findAllHostGroupsForGroup("group2");
        expect(hostGroups.length).to.equal(2);
        provider.managers.groupManager.deleteGroup("group2");
        hostGroups = provider.managers.groupManager.findAllHostGroupsForGroup("group2");
        expect(hostGroups).to.be.undefined;
    });

});