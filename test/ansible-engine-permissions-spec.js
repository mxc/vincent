/**
 * Created by mark on 2016/05/01.
 */
import Provider from '../src/Provider';
import {expect} from 'chai';
import AppUser from '../src/ui/AppUser';
import Host from '../src/modules/host/Host';

describe("Ansible engine security should", ()=> {
    "use strict";
    let provider = new Provider(`${process.cwd()}/conf-example`);

    it("prevent unauthorised users from loading engine definitions", function () {
        let appUser = new AppUser("newton", ["devops", "dev"]);
        let host = new Host(provider, "dogzrule.co.za", "einstein", "sysadmin", 774);
        provider.managers.hostManager.addHost(host);
        let result =   provider.engine.loadEngineDefinition(host, appUser);
        expect(result).to.not.exist;
        provider.managers.hostManager.validHosts = [];
    });


    it("allow authorised users to load engine definitions", function () {
        let appUser = new AppUser("newton", ["devops", "dev"]);
        let host = new Host(provider, "dogzrule.co.za", "einstein", "sysadmin", 775);
        provider.managers.hostManager.addHost(host);
        let result =   provider.engine.loadEngineDefinition(host, appUser);
        expect(result).to.exist;
        provider.managers.hostManager.validHosts = [];
    });


    it("prevent unauthorised users from exporting engine definitions", function (done) {
        let appUser = new AppUser("newton", ["devops", "dev"]);
        let host = new Host(provider, "dogzrule.co.za", "einstein", "sysadmin", 774);
        provider.managers.hostManager.addHost(host);
        provider.engine.export(host, appUser).then((result)=>{
            done("error");
        },err=> {
            provider.managers.hostManager.validHosts = [];
            expect(err.message).to.equal("User newton does not have the required permissions for host dogzrule.co.za for the action engine export.");
            done();
        }).catch((e)=>{
            done(e);
        });
    });


    it("allow authorised users from exporting engine definitions", function (done) {
        let appUser = new AppUser("newton", ["devops", "dev"]);
        let host = new Host(provider, "dogzrule.co.za", "einstein", "sysadmin", 775);
        provider.managers.hostManager.addHost(host);
        let result =   provider.engine.export(host, appUser).then((result)=> {
            expect(result).to.equal("success");
            provider.managers.hostManager.validHosts = [];
            done();
        }).catch((e)=>{
            done(e);
        });
    });

    it("prevent unauthorised users from writing out a playbook", function (done) {
        let appUser = new AppUser("newton", ["devops", "dev"]);
        let host = new Host(provider, "dogzrule.co.za", "einstein", "sysadmin", 774);
        provider.managers.hostManager.addHost(host);
        provider.engine.writePlaybook(host, appUser).then((result)=>{
            done("error");
        },err=> {
            provider.managers.hostManager.validHosts = [];
            expect(err.message).to.equal("User newton does not have the required permissions for host dogzrule.co.za for the action write playbook.");
            done();
        }).catch((e)=>{
            done(e);
        });
    });


    it("allow authorised users to write out a playbook", function (done) {
        let appUser = new AppUser("newton", ["devops", "dev"]);
        let host = new Host(provider, "dogzrule.co.za", "einstein", "sysadmin", 775);
        provider.managers.hostManager.addHost(host);
        //mock out playbook
        provider.engine.playbooks["dogzrule.co.za"].yml="dummy-text";
        let result =   provider.engine.writePlaybook(host, appUser).then((result)=> {
            expect(result).to.equal(provider.engine);
            provider.managers.hostManager.validHosts = [];
            done();
        }).catch((e)=>{
            done(e);
        });
    });


});