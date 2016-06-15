/**
 * Created by mark on 2016/05/26.
 */
"use strict";

import Provider from './../../src/Provider';
import {expect} from 'chai';
import UserAccount from '../../src/modules/user/UserAccount';
import User from '../../src/modules/user/User';


var groups = {
    "owner": "root",
    "group": "groupadmin",
    "permissions": "660",
    "groups": [
        {name: 'group1'},
        {name: 'group2'},
        {name: 'group2'},
        {name: 'group3', gid: 1000},
        {name: 'group4', gid: 1000},
        {gid: 10001}
    ]
};

var users = {
    "owner": "root",
    "group": "useradmin",
    "permissions": "660",
    "users": [
        {name: 'user1', key: 'user1.pub', state: 'present'},
        {name: 'user2', state: 'absent'},
        {name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'},
        {name: 'user4', state: 'present'},
        {name: 'user6', state: 'present', uid: 1001}
    ]
};

var host = {
    name: "www.example.co.za",
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
};

describe("user management should", function () {
    let provider = new Provider();
    provider.managers.userManager.loadFromJson(users);
    provider.managers.groupManager.loadFromJson(groups);
    provider.managers.hostManager.loadFromJson(host);

    it("allow useraccount state to be changed to absent", function () {
        var host = provider.managers.hostManager.findValidHost("www.example.co.za");
        let userAccount = provider.managers.userManager.findUserAccountForHostByUserName(host,"user1");
        expect(userAccount.state).to.equal("present");
        userAccount.state="absent";
        let ua= provider.managers.userManager.findUserAccountForHostByUserName(host,"user1");
        expect(ua.state).to.equal("absent");
    });

    it("throw an error if the useraccount state is changed to an invalid value", function () {
        var host = provider.managers.hostManager.findValidHost("www.example.co.za");
        let ua= provider.managers.userManager.findUserAccountForHostByUserName(host,"user1");
        //expect(()=>{ ua.state='present'}).to.not.throw();
        //expect(()=>{ ua.state='absent'}).to.not.throw();
        ua.state='present';
        expect(()=>{ ua.state='xyz'}).to.throw("UserAccount state can only be present or absent not xyz.");
    });





    it("allow users not added to any hosts to be deleted", function () {
        expect(provider.managers.userManager.findValidUserByName("user6").state).to.equal("present");
        provider.managers.userManager.deleteUser("user6");
        expect(provider.managers.userManager.findValidUserByName("user6")).to.equal(undefined);
    });

    it("find all hosts with a UserAccount for user with provided state", function () {
        expect(provider.managers.userManager.findHostsWithUser("user1", "present").length).to.equal(1);
        expect(provider.managers.userManager.findHostsWithUser("user1", "absent").length).to.equal(0);
        expect(provider.managers.userManager.findHostsWithUser("user1").length).to.equal(1);
    });

    it("find userAccount for host by user name", function () {
        let host = provider.managers.hostManager.findValidHost("www.example.co.za");
        expect(provider.managers.userManager.findUserAccountForHostByUserName(host, "user1").name).to.equal("user1");
    });

    it("prevent users who have userAccounts in validHosts with state 'present'" +
        " from being deleted from validUsers", function () {
        expect(provider.managers.userManager.findValidUserByName("user1").state).to.equal("present");
        let host = provider.managers.hostManager.findValidHost("www.example.co.za");
        expect(provider.managers.userManager.findUserAccountForHostByUserName(host, "user1").user.name).to.equal("user1");
        let func = ()=> {
            provider.managers.userManager.deleteUser("user1");
        };
        expect(func).to.throw("User user1 has accounts in 1 hosts. First mark user as 'absent' before they can be deleted.");
    });

    it('should not allow user state to be changed via direct access', function () {
        let user = provider.managers.userManager.findValidUserByName("user1");
        let func = ()=> {
            user.state = "absent";
        };
        expect(func).to.throw("Cannot set property state of #<User> which has only a getter");
    });


    it("changing user state to 'absent' in validUsers should update all userAccounts in hosts to 'absent", function () {
        var host = provider.managers.hostManager.findValidHost("www.example.co.za");
        try {
            expect(provider.managers.userManager.findValidUserByName("user1").state).to.equal("present");
            expect(provider.managers.userManager.findUserAccountForHostByUserName(host, "user1").name).to.equal("user1");
            provider.managers.userManager.changeUserState('user1', 'absent');
            expect(provider.managers.userManager.findValidUserByName("user1").state).to.equal("absent");
            expect(provider.managers.userManager.findUserAccountForHostByUserName(host, "user1").user.state).to.equal("absent");
        } finally {
            provider.managers.userManager.changeUserState('user1', 'present');
            provider.managers.userManager.findUserAccountForHostByUserName(host, "user1").user.data.state = 'present';
        }
    });

    it("allow users that have been added to any hosts to be marked 'absent' and then removed from validUsers", function () {
        var host = provider.managers.hostManager.findValidHost("www.example.co.za");
        try {
            expect(provider.managers.userManager.findValidUserByName("user1").state).to.equal("present");
            let host = provider.managers.hostManager.findValidHost("www.example.co.za");
            expect(provider.managers.userManager.findUserAccountForHostByUserName(host, "user1").user.name).to.equal("user1");
            provider.managers.userManager.changeUserState('user1', 'absent');
            provider.managers.userManager.deleteUser("user1");
            expect(provider.managers.userManager.findValidUserByName("user1")).to.equal(undefined);
            expect(provider.managers.userManager.findUserAccountForHostByUserName(host, "user1")).to.equal(undefined);
        } finally {
            let user = new User("user1");
            provider.managers.userManager.addValidUser(user);
            provider.managers.userManager.changeUserState('user1', 'present');
            provider.managers.userManager.addUserAccountToHost(host, new UserAccount(provider, {user: user}));
        }
    });

    it("allow users to be removed from a host and remain in validUser list", function () {
        var host = provider.managers.hostManager.findValidHost("www.example.co.za");
        try {
            let user = provider.managers.userManager.findValidUser("user1");
            provider.managers.userManager.removeUserFromHost(host,user);
            expect(provider.managers.userManager.findUserAccountForHostByUserName(host, "user1")).to.equal(undefined);
        } finally {
            provider.managers.userManager.addUserAccountToHost(host, new UserAccount(provider, {
                user: {
                    name: "user1"
                }
            }));
        }
    });


    it("changing a user in validUser from 'absent' to 'present' should not automatically change hosts, groupCategories " +
        "and userCategories to 'present'",function(){
        var host = provider.managers.hostManager.findValidHost("www.example.co.za");
        var user = provider.managers.userManager.findValidUserByName("user2");
        let ua = provider.managers.userManager.findUserAccountForHostByUserName(host,"user2");
        expect(user.state).to.equal("absent");
        expect(ua.user.state).to.equal("absent");
        provider.managers.userManager.changeUserState(user,"present");
        expect(user.state).to.equal("present");
        expect(ua.user.state).to.equal("absent");
    });

    it("all a user account to be removed from a host",()=>{
        var host = provider.managers.hostManager.findValidHost("www.example.co.za");
        expect(provider.managers.userManager.findUserAccountForHostByUserName(host,"user2")).to.not.be.empty;
        provider.managers.userManager.removeUserFromHost(host,"user2");
        expect(provider.managers.userManager.findUserAccountForHostByUserName(host,"user2")).to.be.empty;
    });



});