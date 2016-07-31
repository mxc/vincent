/**
 * Created by mark on 2016/07/31.
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


describe("History UI should", ()=> {

    it("should allow access to the history object",()=>{
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
        let hist = host.getHistory();
        expect(hist.host).to.equal('dogzrule.co.za');
        Vincent.app.provider.managers.hostManager.validHosts = [];
    });

    it("should prevent access to the history object for unauthorized users",()=>{
        let provider = new Provider();
        Vincent.app = {provider: provider,converters:new Map()};
        let appUser = new AppUser("newton", ["dev"], "devops");
        let appUser2 = new AppUser("einstein", ["sysadmin"], "ops");
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
        let hist = host.getHistory();
        host.group="sysadmin";
        host.owner="einstein";
        expect(()=>{ hist.host } ).to.throw("User newton does not have the required permissions for dogzrule.co.za for the action read attribute.");
        Vincent.app.provider.managers.hostManager.validHosts = [];
    });
});