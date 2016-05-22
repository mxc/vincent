/**
 * Created by mark on 2016/05/08.
 */
import Provider from '../../src/Provider';
import {expect} from 'chai';
import AppUser from '../../src/ui/AppUser';
import UserUI from '../../src/modules/user/ui/console/User';
import UserManagerUI from '../../src/modules/user/ui/console/UserManager';
import HostManagerUI from '../../src/modules/host/ui/console/HostManager';
import Vincent from '../../src/Vincent';
import User from '../../src/modules/user/User';

describe("UserManager UI should", ()=> {

    //by default root user and useradmin group have read/write access to the user account store

    let provider = new Provider();
    Vincent.app = {provider: provider};

    it("allow authorised users to add new Users to valid user list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");
            expect(user.name).to.equal("demoUser");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });


    it("allow authorised users to add new Users with user name and uid to valid user list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser({name: "demoUser", uid: 1000, state: "absent"});
            expect(user.name).to.equal("demoUser");
            expect(user.uid).to.equal(1000);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("prevent unauthorised users from adding new Users to valid user list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser("demoUser");
            expect(user).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("allow authorised users to retrieve a user instance", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser("demoUser");
            let user2 = userManagerUi.getUser("demoUser");
            expect(user).to.deep.equal(user2);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("prevent unauthorised users from retrieving user instance ", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");

            //by default all users have read permission on user list.
            //switch it off for test
            Vincent.app.provider.managers.userManager.permissions = 660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let user2 = userManagerUi2.getUser("demoUser");
            expect(user2).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("prevent unauthorised users from retrieving user instance ", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            //let hostManagerUi = new HostManagerUI(appUser);
            //let host = hostManagerUi.addHost("dogzrule.co.za");
            let user = userManagerUi.addUser("demoUser");

            //by default all users have read permission on user list.
            //switch it off for test
            userManagerUi.permissions = 660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let user2 = userManagerUi2.getUser("demoUser");
            expect(user2).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });

    it("prevent unauthorised users from list user names", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);

            userManagerUi.addUser("demoUser1");
            userManagerUi.addUser("demoUser2");
            userManagerUi.addUser("demoUser3");

            //by default all users have read permission on user list.
            //switch it off for test
            userManagerUi.permissions = 660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let list = userManagerUi2.list();
            expect(list.length).to.equal(0);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });

    it("allow authorised users to list user names", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);

            userManagerUi.addUser("demoUser1");
            userManagerUi.addUser("demoUser2");
            userManagerUi.addUser("demoUser3");

            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);

            let list = userManagerUi2.list();
            expect(list.length).to.equal(3);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });


    it("allow authorised users to save the user list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            userManagerUi.addUser("demoUser1");
            userManagerUi.addUser("demoUser2");
            userManagerUi.addUser("demoUser3");
            let result = userManagerUi.save();
            expect(result).to.equal("no backup required.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("prevent unauthorised users from saving the user list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            userManagerUi.addUser("demoUser1");
            userManagerUi.addUser("demoUser2");
            userManagerUi.addUser("demoUser3");
            userManagerUi.permissions = "000";
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let userManagerUi2 = new UserManagerUI(appUser2);
            let result = userManagerUi2.save();
            expect(result).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });

    it("prevent users with duplicate username or uids from  being created", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "useradmin"], "devops");
            let userManagerUi = new UserManagerUI(appUser);
            userManagerUi.addUser("demoUser1");
            let user = userManagerUi.addUser("demoUser1");
            expect(user).to.be.false;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("allow authorised users to add UserAccounts to host by name", ()=> {
        try {
            let appUser = new AppUser("einstein", ["dev", "useradmin"], "audit");
            Vincent.app.provider.managers.userManager.loadConsoleUIForSession({},appUser);
            let userManagerUi = new UserManagerUI(appUser);
            let hostManagerUi = new HostManagerUI(appUser);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            let user = userManagerUi.addUser({name: "newton", uid: 1000, state: "present"});
            let userAccount = host.addUserAccount('newton');
            expect(userAccount.user).to.deep.equal(user);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });

    it("throw an exception when authorised users tries to add an invalid user to a host", ()=> {
        try {
            let appUser = new AppUser("einstein", ["dev", "useradmin"], "audit");
            Vincent.app.provider.managers.userManager.loadConsoleUIForSession({},appUser);
            let userManagerUi = new UserManagerUI(appUser);
            let hostManagerUi = new HostManagerUI(appUser);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            let func = function(){  host.addUserAccount('newton'); };
            expect(func).to.throw("The user newton is not a valid user.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });


    it("throw an exception when an unauthorised users tries to add a valid user ", ()=> {
        try {
            let appUser = new AppUser("einstein", ["dev", "useradmin"], "audit");
            Vincent.app.provider.managers.userManager.loadConsoleUIForSession({},appUser);
            let hostManagerUi = new HostManagerUI(appUser);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser({name: "pascal", uid: 1001, state: "present"});
            //change permissions so user has no access to host
            host.group = "ops";
            host.owner = "newton";
            let func = ()=>{ host.addUserAccount('pascal'); }
            expect(func).to.throw("User einstein does not have the required permissions for www.coffeecup.co.za for the action write attribute.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });

    it("should allow a UserAccount to be defined by a data object",()=>{
        try {
            let appUser = new AppUser("einstein", ["dev", "useradmin"], "audit");
            Vincent.app.provider.managers.userManager.loadConsoleUIForSession({}, appUser);
            let hostManagerUi = new HostManagerUI(appUser);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            let userManagerUi = new UserManagerUI(appUser);
            let user = userManagerUi.addUser({name: "pascal", uid: 1001, state: "present"});
            userManagerUi.addUser({name: "descarts", uid: 1002, state: "present"});
            let userAccount =  host.addUserAccount({user: 'pascal', authorized_keys: [{name:"descarts", state:"present"}]});
            expect(userAccount.user.name).to.equal("pascal");
        }finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });


    it("should allow authorized users to get a list of user categories",()=>{

        var validUsers = [
            new User({name: 'user1', key: 'user1.pub', state: 'present', uid: undefined}),
            new User({name: 'user2', key: undefined, state: 'absent', uid: undefined}),
            new User({name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'}),
            new User({name: 'user4', key: undefined, state: 'present', uid: undefined})
        ];

        var userCategories = [
            {
                "name": "cat1",
                "config": [
                    {
                        user: {
                            name: "user1",
                            state: "absent"
                        },
                        authorized_keys: [
                            {name: "user2"},
                            {name: "user1"}]
                    },
                    {
                        user: {
                            name: "user2"
                        }
                    }
                ]
            },
            {
                "name": "cat2",
                "config": [
                    {user: {name: "user3", state: "present"}},
                    {user: {name: "user1"}, authorized_keys: [{name: "user2"}, {name: "user1"}]}
                ]
            }
        ];


        try {
            let appUser = new AppUser("einstein", ["dev", "useradmin"], "audit");
            Vincent.app.provider.managers.userManager.validUsers = validUsers;
            Vincent.app.provider.managers.userCategories.loadFromJson(userCategories);
            let userManagerUi = new UserManagerUI(appUser);
            expect(userManagerUi.listUserCategories()[0].userAccounts[0].name).to.equal("user1");
          }finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
            Vincent.app.provider.managers.userManager.permissions = 664;
        }
    });

});