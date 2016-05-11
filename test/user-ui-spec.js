/**
 * Created by mark on 2016/05/09.
 */

import Provider from '../src/Provider';
import {expect} from 'chai';
import AppUser from '../src/ui/AppUser';
import UserUI from '../src/modules/user/ui/console/User';
import UserManagerUI from '../src/modules/user/ui/console/UserManager';
import HostManagerUI from '../src/modules/host/ui/console/HostManager';
import Vincent from '../src/Vincent';

describe("UI User object should", ()=> {

    //by default root user and useradmin group have read/write access to the user account store
    let provider = new Provider();
    Vincent.app = {provider: provider};

    it("allow authorised users to create users", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser("demoUser1");
            let user1 = userManagerUi.addUser({name: "demoUser2", uid: 1000});
            let user2 = userManagerUi.addUser({name: "demoUser3", uid: 1001, state: "present"});
            expect(user.name).to.equal("demoUser1");
            expect(user.uid).to.be.empty;
            expect(user1.name).to.equal("demoUser2");
            expect(user1.uid).to.equal(1000);
            expect(user2.name).to.equal("demoUser3");
            expect(user2.uid).to.equal(1001);
            expect(user2.state).to.equal("present");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });


    it("return false when creating users with incorrect parameters", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser();
            expect(user).to.be.false;
            user = userManagerUi.addUser({name: "demoUser2", uid: "abc"})
            expect(user).to.be.false;
            user = userManagerUi.addUser({name: "demoUser3", uid: 1001, state: "deleted"}); //state can only be absetn or present
            expect(user).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });


    it("prevent users being created with duplicate names or uids", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser("demoUser2");
            let user2 = userManagerUi.addUser({name: "demoUser2", uid: 1000});
            expect(user2).to.be.false;
            user2 = userManagerUi.addUser({name: "demoUser3", uid: 1000});
            let user3 = userManagerUi.addUser({name: "demoUser4", uid: 1000, state: "present"});
            expect(user3).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });


    it("allow authorised users to read user properties", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser({name: "demoUser2", uid: 1000, state: "absent"});
            expect(user.name).to.equal("demoUser2");
            expect(user.uid).to.equal(1000);
            expect(user.state).to.equal("absent");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });

    it("prevent unauthorised users from writing user properties", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser({name: "demoUser2", uid: 1000, state: "absent"});

            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);
            let user2 = userManagerUi2.getUser("demoUser2");
            let func = ()=>{
                user2.name = "test2";
            };
            expect(func).to.throw("User einstein does not have the required permissions for UserManager for the action write attribute");
            func = ()=>{
                user2.name = "test2";
            };
            expect(func).to.throw("User einstein does not have the required permissions for UserManager for the action write attribute");
            func = ()=>{
                user2.uid = 1004;
            };
            expect(func).to.throw("User einstein does not have the required permissions for UserManager for the action write attribute");
            func = ()=>{
                user2.state = "absent";
            };
            expect(func).to.throw("User einstein does not have the required permissions for UserManager for the action write attribute");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });


});



// describe("UI Manager ", ()=> {
//
//     //by default root user and useradmin group have read/write access to the user account store
//     let provider = new Provider();
//     Vincent.app = {provider: provider};
//
//
//
// });