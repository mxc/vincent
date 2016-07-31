/**
 * Created by mark on 2016/07/28.
 */
import Provider from '../../src/Provider';
import SystemUpdateManagerUI from '../../src/modules/applications/systemupdate/ui/console/SystemUpdateManager';
import {expect} from 'chai';
import AppUser from '../../src/ui/AppUser';
import HostManagerUI from '../../src/modules/host/ui/console/HostManager';
import Vincent from '../../src/Vincent';
import Session from '../../src/ui/Session';
import Debian from '../../src/modules/applications/systemupdate/Debian';
import Redhat from '../../src/modules/applications/systemupdate/Redhat';
import SystemUpdate from '../../src/modules/applications/systemupdate/ui/console/SystemUpdate';


describe("SystemUpdate UI should", ()=> {

   it("be able to add a system update to a debian host ",()=>{
       let provider = new Provider();
       Vincent.app = {provider: provider,converters:new Map()};
       let appUser = new AppUser("newton", ["dev"], "devops");
       let result = "";
       let session = new Session();
       session.appUser = appUser;
       session.console = {
           test: function () {
           },
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

       session.socket = {
           write: ()=> {
           }
       };

       let hostManagerUi = new HostManagerUI(session);
       let host = hostManagerUi.addHost("dogzrule.co.za");
       host.osFamily="Debian";
       let systemUpdateManager = new SystemUpdateManagerUI(session);
       let sysUp = systemUpdateManager.addSystemUpdateConfig(host);
       expect(sysUp instanceof SystemUpdate).to.be.true;
       Vincent.app.provider.managers.hostManager.validHosts = [];
   });

    it("be able to add a system update to a redhat host ",()=>{
        let provider = new Provider();
        Vincent.app = {provider: provider,converters:new Map()};
        let appUser = new AppUser("newton", ["dev"], "devops");
        let result = "";
        let session = new Session();
        session.appUser = appUser;
        session.console = {
            test: function () {
            },
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

        session.socket = {
            write: ()=> {
            }
        };

        let hostManagerUi = new HostManagerUI(session);
        let host = hostManagerUi.addHost("dogzrule.co.za");
        host.osFamily="Redhat";
        let systemUpdateManager = new SystemUpdateManagerUI(session);
        let sysUp = systemUpdateManager.addSystemUpdateConfig(host);
        expect(sysUp instanceof SystemUpdate).to.be.true;
        Vincent.app.provider.managers.hostManager.validHosts = [];
    });

    it("be able to add a system update to a debian host ",()=>{
        let provider = new Provider();
        Vincent.app = {provider: provider,converters:new Map()};
        let appUser = new AppUser("newton", ["dev"], "devops");
        let result = "";
        let session = new Session();
        session.appUser = appUser;
        session.console = {
            test: function () {
            },
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

        session.socket = {
            write: ()=> {
            }
        };

        let hostManagerUi = new HostManagerUI(session);
        let host = hostManagerUi.addHost("dogzrule.co.za");
        host.osFamily="Unknown";
        let systemUpdateManager = new SystemUpdateManagerUI(session);
        let sysUp = systemUpdateManager.addSystemUpdateConfig(host);
        expect(result).to.be.equal("No System Update class found for osFamily Unknown");
        Vincent.app.provider.managers.hostManager.validHosts = [];
    });


});