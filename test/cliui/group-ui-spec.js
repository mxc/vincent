/**
 * Created by mark on 2016/08/01.
 */
import Provider from '../../src/Provider';
import {expect} from 'chai';
import AppUser from '../../src/ui/AppUser';
import GroupUI from '../../src/modules/group/ui/console/Group';
import groupManagerUi from '../../src/modules/user/ui/console/UserManager';
import GroupManagerUI from '../../src/modules/group/ui/console/GroupManager';
import HostManagerUI from '../../src/modules/host/ui/console/HostManager';
import Vincent from '../../src/Vincent';
import Session from '../../src/ui/Session'

describe("UI Group object should", ()=> {

    //by default root user and useradmin group have read/write access to the user account store
    let provider = new Provider();
    Vincent.app = {provider: provider};

    it("allow authorised users to create groups", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                outputError: function (msg) {
                    result=msg;
                },
                outputWarning: function (msg) {
                    result = msg;
                },
                outputSuccess: function (msg) {
                    result =  msg;
                }
            };
            let groupManagerUi = new GroupManagerUI(session);
            let group = groupManagerUi.addGroup("demoGroup1");
            console.log(result);
            let group1 = groupManagerUi.addGroup({name: "demoGroup2", gid: 1000});
            let group2 = groupManagerUi.addGroup({name: "demoGroup3", gid: 1001, state: "present"});

            expect(group.name).to.equal("de" +
                "moGroup1");
            expect(group.gid).to.equal("-");
            expect(group1.name).to.equal("demoGroup2");
            expect(group1.gid).to.equal(1000);
            expect(group2.name).to.equal("demoGroup3");
            expect(group2.gid).to.equal(1001);
            expect(group2.state).to.equal("present");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });


    it("return an error message when creating groups with incorrect parameters", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                outputError: function (msg) {
                    result=msg;
                },
                outputWarning: function (msg) {
                    result = msg;
                },
                outputSuccess: function (msg) {
                    result =  msg;
                }
            };

            let groupManagerUi = new GroupManagerUI(session);
            let group = groupManagerUi.addGroup();
            expect(result).to.equal("Parameter must be a group name or group data object.");
            group = groupManagerUi.addGroup({name: "demoUser2", gid: "abc"});
            expect(result).to.equal("Gid must be a number.");
            group = groupManagerUi.addGroup({name: "demoUser3", gid: 1001, state: "deleted"}); //state can only be absetn or present
            expect(result).to.equal('Group state must be "present" or "absent".');
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });


    it("prevent groups being created with duplicate names or gids", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                outputError: function (msg) {
                    result=msg;
                },
                outputWarning: function (msg) {
                    result = msg;
                },
                outputSuccess: function (msg) {
                    result =  msg;
                }
            };
            let groupManagerUi = new GroupManagerUI(session);
            let group = groupManagerUi.addGroup("demoGroup2");
            let group2 = groupManagerUi.addGroup({name: "demoGroup2", gid: 1000});
            expect(group2).to.be.undefined;
            expect(result).to.equal("Group demoGroup2 already exists with different group id.");
            group2 = groupManagerUi.addGroup({name: "demoGroup3", gid: 1000});
            let group3 = groupManagerUi.addGroup({name: "demoUser4", gid: 1000, state: "present"});
            expect(result).to.equal('Group demoUser4 with gid 1000 already exists as demoGroup3 with gid 1000.');
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });


    it("allow authorised users to read group properties", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                outputError: function (msg) {
                    result=msg;
                },
                outputWarning: function (msg) {
                    result = msg;
                },
                outputSuccess: function (msg) {
                    result =  msg;
                }
            };
            let groupManagerUi = new GroupManagerUI(session);
            let group = groupManagerUi.addGroup({name: "demoGroup2", gid: 1000, state: "absent"});
            expect(group.name).to.equal("demoGroup2");
            expect(group.gid).to.equal(1000);
            expect(group.state).to.equal("absent");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });

    it("allow valid  group to be added to hosts", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                outputError: function (msg) {
                    result=msg;
                },
                outputWarning: function (msg) {
                    result = msg;
                },
                outputSuccess: function (msg) {
                    result =  msg;
                }
            };
            let context = {};
            Vincent.app.provider.managers.groupManager.loadConsoleUIForSession(context,session);
            let groupManagerUi = new GroupManagerUI(session);
            let hostManagerUi = new HostManagerUI(session);
            let group = groupManagerUi.addGroup({name: "demoGroup2", gid: 1000, state: "absent"});
            let host = hostManagerUi.addHost("192.168.122.21");
            let hostGroup = host.addHostGroup("demoGroup2");
            hostGroup.become=true;
            expect(hostGroup.become).to.be.true;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });

});
