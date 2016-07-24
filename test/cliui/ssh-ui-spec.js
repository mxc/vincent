/**
 * Created by mark on 2016/07/23.
 */
import Provider from '../../src/Provider';
import {expect} from 'chai';
import AppUser from '../../src/ui/AppUser';
import HostManagerUI from '../../src/modules/host/ui/console/HostManager';
import SSHManagerUI from '../../src/modules/ssh/ui/console/SSHManager';
import Vincent from '../../src/Vincent';
import Session from '../../src/ui/Session';

describe("HostManager UI should", ()=> {



    it("adding a ssh definition to a host via label should succeed", ()=> {
        var provider = new Provider();
        Vincent.app = {provider: provider,converters:new Map()};
        var sshConfigs = {
            owner: "einstein",
            group: "sysadmin",
            permissions: "770",
            configs: [
                {
                    name: "strict",
                    config: {
                        permitRoot: "no",
                        validUsersOnly: "true",
                        passwordAuthentication: "no"
                    }
                },
                {
                    name: "strict_with_root",
                    config: {
                        permitRoot: "without-password",
                        validUsersOnly: "true",
                        passwordAuthentication: "no"
                    }
                },
                {
                    name: "loose",
                    config: {
                        permitRoot: "yes",
                        validUsersOnly: "false",
                        passwordAuthentication: "yes"
                    }
                }
            ]
        };
        let appUser = new AppUser("newton", ["dev"], "devops");
        let session = new Session();
        let result="";
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

        session.socket = {
            write: ()=> {
            }
        };

        let sshManagerUi = new SSHManagerUI(session);
        Vincent.app.provider.managers.sshManager.loadConsoleUIForSession({},session);
        Vincent.app.provider.managers.sshManager.loadFromJson(sshConfigs);
        let hostManagerUi = new HostManagerUI(session);
        let host = hostManagerUi.addHost("dogzrule.co.za");
        let ssh = host.addSshConfig("strict");
        expect(host.listConfigs[0]).to.equal("ssh");
        expect(host.getConfig("ssh").permitRoot).to.be.false;
        expect(host.getConfig("ssh").passwordAuthentication).to.be.false;
        expect(host.getConfig("ssh").validUsersOnly).to.be.true;
    });



    it("a user with the correct permissions should be able to change SSH properties once added to host", ()=> {
        var provider = new Provider();
        Vincent.app = {provider: provider,converters:new Map()};
        var sshConfigs = {
            owner: "einstein",
            group: "sysadmin",
            permissions: "770",
            configs: [
                {
                    name: "strict",
                    config: {
                        permitRoot: "no",
                        validUsersOnly: "true",
                        passwordAuthentication: "no"
                    }
                },
                {
                    name: "strict_with_root",
                    config: {
                        permitRoot: "without-password",
                        validUsersOnly: "true",
                        passwordAuthentication: "no"
                    }
                },
                {
                    name: "loose",
                    config: {
                        permitRoot: "yes",
                        validUsersOnly: "false",
                        passwordAuthentication: "yes"
                    }
                }
            ]
        };
        let appUser = new AppUser("newton", ["dev"], "devops");
        let session = new Session();
        let result="";
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

        session.socket = {
            write: ()=> {
            }
        };

        let sshManagerUi = new SSHManagerUI(session);
        Vincent.app.provider.managers.sshManager.loadConsoleUIForSession({},session);
        Vincent.app.provider.managers.sshManager.loadFromJson(sshConfigs);
        let hostManagerUi = new HostManagerUI(session);
        let host = hostManagerUi.addHost("dogzrule.co.za");
        let ssh = host.addSshConfig("strict");
        expect(host.getConfig("ssh").permitRoot).to.be.false;
        let sshc = host.getConfig("ssh");
        sshc.permitRoot = true;
        expect(host.getConfig("ssh").permitRoot).to.be.true;
    });


    it("prevent an unauthorized user from reading nad writing ssh settings", ()=> {
        var provider = new Provider();
        Vincent.app = {provider: provider, converters: new Map()};
        var sshConfigs = {
            owner: "einstein",
            group: "sysadmin",
            permissions: "770",
            configs: [
                {
                    name: "strict",
                    config: {
                        permitRoot: "no",
                        validUsersOnly: "true",
                        passwordAuthentication: "no"
                    }
                },
                {
                    name: "strict_with_root",
                    config: {
                        permitRoot: "without-password",
                        validUsersOnly: "true",
                        passwordAuthentication: "no"
                    }
                },
                {
                    name: "loose",
                    config: {
                        permitRoot: "yes",
                        validUsersOnly: "false",
                        passwordAuthentication: "yes"
                    }
                }
            ]
        };
        let appUser = new AppUser("newton", ["dev"], "devops");
        let session = new Session();
        let result = "";
        session.appUser = appUser;
        session.console = {
            outputError: function (msg) {
                result = msg;
            },
            outputWarning: function (msg) {
                result = msg;
            },
            outputSuccess: function (msg) {
                result = msg;
            }
        };


        let sshManagerUi = new SSHManagerUI(session);
        Vincent.app.provider.managers.sshManager.loadConsoleUIForSession({}, session);
        Vincent.app.provider.managers.sshManager.loadFromJson(sshConfigs);
        let hostManagerUi = new HostManagerUI(session);
        let host = hostManagerUi.addHost("dogzrule.co.za");
        let ssh = host.addSshConfig("strict");
        expect(host.getConfig("ssh").permitRoot).to.be.false;
        let sshc = host.getConfig("ssh");
        let appUser2 = new AppUser("einstein", ["adm"], "sys");
        let session2 = new Session();
        let result2 = "";
        session2.appUser = appUser2;
        session2.console = {
            outputError: function (msg) {
                result2 = msg;
            },
            outputWarning: function (msg) {
                result2 = msg;
            },
            outputSuccess: function (msg) {
                result2 = msg;
            }
        };
        let hostManagerUi2 = new HostManagerUI(session2);
        let host2 = hostManagerUi2.getHost("dogzrule.co.za");
        expect(result2).to.equal("User einstein does not have the required permissions for dogzrule.co.za for the action read attribute.");
        host.group="none";
        host.owner="none";
        expect(()=>{ host.getConfig("ssh") }).to.throw("User newton does not have the required permissions for dogzrule.co.za for the action read attribute.");
        expect(()=>{ sshc.permitRoot}).to.throw("User newton does not have the required permissions for dogzrule.co.za for the action read attribute.");
    });
});