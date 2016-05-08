/**
 * Created by mark on 2016/05/08.
 */
import Provider from '../src/Provider';
import {expect} from 'chai';
import AppUser from '../src/ui/AppUser';
import UserUI from '../src/modules/user/ui/console/User';
import UserManagerUI from '../src/modules/user/ui/console/UserManager';
import HostManagerUI from '../src/modules/host/ui/console/HostManager';
import Vincent from '../src/Vincent';

describe("UserManager UI should", ()=> {

    //by default root user and root group have read/write access to the user account store

    var provider = new Provider();
    Vincent.app = {provider: provider};

    it("allow authorised users to add new Users to valid user list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "root"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");
            expect(user.name).to.equal("demoUser");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts=[];
            Vincent.app.provider.managers.userManager.validUsers=[];
        }
    });


    it("prevent unauthorised users from adding new Users to valid user list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");
            expect(user).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts=[];
            Vincent.app.provider.managers.userManager.validUsers=[];
        }
    });

    it("allow authorised users to retrieve a user instance",()=>{
        try {
            let appUser = new AppUser("newton", ["dev","root"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");
            let user2 = userManagerUi.getUser("demoUser");
            expect(user).to.deep.equal(user2);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts=[];
            Vincent.app.provider.managers.userManager.validUsers=[];
        }
    });

    it("prevent unauthorised users from retrieving user instance ",()=>{
        try {
            let appUser = new AppUser("newton", ["dev","root"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");

            //by default all users have read permission on user list.
            //switch it off for test
            Vincent.app.provider.managers.userManager.permissions=660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let user2 = userManagerUi2.getUser("demoUser");
            expect(user2).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts=[];
            Vincent.app.provider.managers.userManager.validUsers=[];
        }
    });

    it("prevent unauthorised users from retrieving user instance ",()=>{
        try {
            let appUser = new AppUser("newton", ["dev","root"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");

            //by default all users have read permission on user list.
            //switch it off for test
            userManagerUi.permissions=660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let user2 = userManagerUi2.getUser("demoUser");
            expect(user2).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts=[];
            Vincent.app.provider.managers.userManager.validUsers=[];
            Vincent.app.provider.managers.userManager.permissions=664;
        }
    });

    it("prevent unauthorised users from list user names",()=>{
        try {
            let appUser = new AppUser("newton", ["dev","root"], "devops");
            let userManagerUi = new UserManagerUI(appUser);

            userManagerUi.addUser("demoUser1");
            userManagerUi.addUser("demoUser2");
            userManagerUi.addUser("demoUser3");

            //by default all users have read permission on user list.
            //switch it off for test
            userManagerUi.permissions=660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let list = userManagerUi2.list();
            expect(list.length).to.equal(0);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts=[];
            Vincent.app.provider.managers.userManager.validUsers=[];
            Vincent.app.provider.managers.userManager.permissions=664;
        }
    });

    it("allow authorised users to list user names",()=>{
        try {
            let appUser = new AppUser("newton", ["dev","root"], "devops");
            let userManagerUi = new UserManagerUI(appUser);

            userManagerUi.addUser("demoUser1");
            userManagerUi.addUser("demoUser2");
            userManagerUi.addUser("demoUser3");

            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let list = userManagerUi2.list();
            expect(list.length).to.equal(3);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts=[];
            Vincent.app.provider.managers.userManager.validUsers=[];
        }
    });

});