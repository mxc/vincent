/**
 * Created by mark on 2016/08/01.
 */
import Provider from '../../src/Provider';
import {expect} from 'chai';
import AppUser from '../../src/ui/AppUser';
import UserUI from '../../src/modules/user/ui/console/User';
import GroupManagerUI from '../../src/modules/group/ui/console/GroupManager';
import HostManagerUI from '../../src/modules/host/ui/console/HostManager';
import Vincent from '../../src/Vincent';
import Session from '../../src/ui/Session';

describe("GroupManager UI should", ()=> {

    //vincent is the default group with write/read/execute permissions
    let provider = new Provider();
    Vincent.app = {provider: provider};

    it("allow authorised users to add new Groups to valid group list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            let group = groupManagerUi.addGroup("demoGroup");
            expect(group.name).to.equal("demoGroup");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
        }
    });


    it("allow authorised users to add new Groups with group name and gid to valid group list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            let group = groupManagerUi.addGroup({name: "demoGroup", gid: 1000, state: "absent"});
            expect(group.name).to.equal("demoGroup");
            expect(group.gid).to.equal(1000);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("prevent unauthorised users from adding new Groups to valid group list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            let group = groupManagerUi.addGroup("demoGroup");
            expect(result).to.equal("User newton does not have the required permissions for GroupManager for the action write attribute.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
        }
    });

    it("allow authorised users to retrieve a group instance", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            let group = groupManagerUi.addGroup("demoGroup");
            let group2 = groupManagerUi.getGroup("demoGroup");
            expect(group).to.deep.equal(group2);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
        }
    });

    it("prevent unauthorised users from retrieving group instance ", ()=> {
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
            let group = groupManagerUi.addGroup("demoGroup");

            //by default all users have read permission on group list.
            //switch it off for test
            Vincent.app.provider.managers.groupManager.permissions = 660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let session2 = new Session();
            session2.appUser = appUser2;
            session2.console={
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
            let groupManagerUi2 = new GroupManagerUI(session2);

            let group2 = groupManagerUi2.getGroup("demoGroup");
            expect(result).to.equal("User einstein does not have the required permissions for GroupManager for the action read attribute.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.userManager.validUsers = [];
        }
    });

    it("prevent unauthorised users from retrieving a group instance ", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            let group = groupManagerUi.addGroup("demoGroup");

            //by default all users have read permission on user list.
            //switch it off for test
            groupManagerUi.permissions = 660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let result2="";
            let session2 = new Session();
            session2.appUser = appUser2;
            session2.console={
                test:function(){},
                outputError: function (msg) {
                    result2=msg;
                },
                outputWarning: function (msg) {
                    result2 = msg;
                },
                outputSuccess: function (msg) {
                    result2 =  msg;
                }
            };

            let groupManagerUi2 = new GroupManagerUI(session2);
            let group2 = groupManagerUi2.getGroup("demoGroup");
            expect(result2).to.equal("User einstein does not have the required permissions for GroupManager for the action read attribute.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });

    it("prevent unauthorised users from obtaining list of group names", ()=> {
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

            groupManagerUi.addGroup("demoGroup1");
            groupManagerUi.addGroup("demoGroup2");
            groupManagerUi.addGroup("demoGroup3");

            //by default all users have read permission on user list.
            //switch it off for test
            groupManagerUi.permissions = 660;
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let session2 = new Session();
            session2.appUser = appUser2;
            session2.console={
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

            let groupManagerUi2 = new GroupManagerUI(session2);

            let list = groupManagerUi2.list;
            expect(result).to.equal("User einstein does not have the required permissions for GroupManager for the action read attribute.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });

    it("allow authorised users to list group names", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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

            groupManagerUi.addGroup("demoGroup1");
            groupManagerUi.addGroup("demoGroup2");
            groupManagerUi.addGroup("demoGroup3");

            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let groupManagerUi2 = new GroupManagerUI(session);

            let list = groupManagerUi2.list;
            expect(list.length).to.equal(3);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
        }
    });


    it("allow authorised users to save the group list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            groupManagerUi.addGroup("demoGroup1");
            groupManagerUi.addGroup("demoGroup2");
            groupManagerUi.addGroup("demoGroup3");
            let result2 = groupManagerUi.save();
            expect(result2).to.be.true;
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
        }
    });

    it("prevent unauthorised users from saving the group list", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            groupManagerUi.addGroup("demoGroup1");
            groupManagerUi.addGroup("demoGroup2");
            groupManagerUi.addGroup("demoGroup3");
            groupManagerUi.permissions = "000";
            let appUser2 = new AppUser("einstein", ["dev"], "devops");
            let result2="";
            let session2 = new Session();
            session2.appUser = appUser2;
            session2.console={
                test:function(){},
                outputError: function (msg) {
                    result2=msg;
                },
                outputWarning: function (msg) {
                    result2 = msg;
                },
                outputSuccess: function (msg) {
                    result2 =  msg;
                }
            };
            let groupManagerUi2 = new GroupManagerUI(session2);
            result = groupManagerUi2.save();
            expect(result2).to.equal("User einstein does not have the required permissions for GroupManager for the action write attribute.");

        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });

    it("prevent users with duplicate groupname or gids from  being created", ()=> {
        try {
            let appUser = new AppUser("newton", ["dev", "vincent"], "devops");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            groupManagerUi.addGroup("demoGroup1");
            let user = groupManagerUi.addGroup("demoGroup1");
            expect(user).to.be.undefined;
            expect(result).to.equal("Group demoGroup1 already exists.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
        }
    });

    it("allow authorised users to add HostGroups to host by name", ()=> {
        try {
            let appUser = new AppUser("einstein", ["dev", "vincent"], "audit");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
                outputError: function (msg) {
                    console.log("called");
                    result=msg;
                },
                outputWarning: function (msg) {
                    result = msg;
                },
                outputSuccess: function (msg) {
                    console.log("called");
                    result =  msg;
                }
            };
            Vincent.app.provider.managers.groupManager.loadConsoleUIForSession({},session);
            let groupManagerUi = new GroupManagerUI(session);
            let hostManagerUi = new HostManagerUI(session);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            let group = groupManagerUi.addGroup({name: "devops", uid: 1000, state: "present"});
            let hostGroup = host.addHostGroup('devops');
            expect(hostGroup.group).to.deep.equal(group);
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });

    it("throw an exception when authorised users tries to add an invalid group to a host", ()=> {
        try {
            let appUser = new AppUser("einstein", ["dev", "vincent"], "audit");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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
            Vincent.app.provider.managers.groupManager.loadConsoleUIForSession({},session);
            let groupManagerUi = new GroupManagerUI(session);
            let hostManagerUi = new HostManagerUI(session);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            host.addHostGroup('monitor');
            expect(result).to.equal("The group monitor is not a valid group.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });


    it("throw an exception when an unauthorised users tries to add a valid group ", ()=> {
        try {
            let appUser = new AppUser("einstein", ["dev", "vincent"], "audit");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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

            Vincent.app.provider.managers.groupManager.loadConsoleUIForSession({},session);
            let hostManagerUi = new HostManagerUI(session);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            let groupManagerUi = new GroupManagerUI(session);
            let group = groupManagerUi.addGroup({name: "ops", uid: 1001, state: "present"});
            //change permissions so user has no access to host
            host.group = "ops";
            host.owner = "newton";
            expect(()=>{ host.addHostGroup('ops')} ).to.throw("User einstein does not have the required permissions for www.coffeecup.co.za for the action write attribute.");
        } finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });

    it("should allow a GroupAccount to be defined by a data object",()=>{
        try {
            let appUser = new AppUser("einstein", ["dev", "vincent"], "audit");
            let result="";
            let session = new Session();
            session.appUser = appUser;
            session.console={
                test:function(){},
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

            Vincent.app.provider.managers.groupManager.loadConsoleUIForSession({},session);
            let hostManagerUi = new HostManagerUI(session);
            let host = hostManagerUi.addHost("www.coffeecup.co.za");
            let groupManagerUi = new GroupManagerUI(session);
            let group = groupManagerUi.addGroup({name: "ops", uid: 1001, state: "present"});
            groupManagerUi.addGroup({name: "backup", uid: 1002, state: "present"});
            let groupAccount =  host.addHostGroup({group: 'ops',members:[]});
            console.log(result);
            expect(groupAccount.group.name).to.equal("ops");
        }finally {
            Vincent.app.provider.managers.hostManager.validHosts = [];
            Vincent.app.provider.managers.groupManager.validGroups = [];
            Vincent.app.provider.managers.groupManager.permissions = 664;
        }
    });


});