/**
 * Created by mark on 2016/05/01.
 */
import Provider from '../src/Provider';
import {expect} from 'chai';
import AppUser from '../src/ui/AppUser';
import Host from '../src/modules/host/Host';

describe("HostManager security should", ()=> {
    "use strict";
    let provider = new Provider(`${process.cwd()}/conf-example`);

    it("prevent unauthorised users from accessing hosts", function () {
        let appUser = new AppUser("newton",["devops","dev"]);
        let host = new Host(provider,"dogzrule.co.za","einstein","sysadmin",770);
        provider.managers.hostManager.addHost(host);
        let func = ()=>{
            provider.managers.hostManager.findValidHost(host,appUser);
        };
        expect(func).to.throw("User newton does not have the required permissions for host dogzrule.co.za for the action find valid host.");
        provider.managers.hostManager.validHosts=[];
    });

    it("allow authorised users access to hosts", function () {
        let appUser = new AppUser("newton",["devops","dev"]);
        let host = new Host(provider,"dogzrule.co.za","einstein","devops",740);
        provider.managers.hostManager.addHost(host);
        let fHost =  provider.managers.hostManager.findValidHost(host,appUser);
        expect(fHost).to.exist;
        provider.managers.hostManager.validHosts=[];
    });

    it("reject invalid parameters for findValidHost",()=>{
        let appUser = new AppUser("newton",["devops","dev"]);
        let func =()=>  {
            provider.managers.hostManager.findValidHost({},appUser);
        };
        expect(func).to.throw("The host parameter must be of type Host or a host name and must be in validHosts");
        provider.managers.hostManager.validHosts=[];
    });


    it("grant access to vadmin users",()=>{
        let appUser = new AppUser("newton",["devops","dev","vadmin"]);
        let host = new Host(provider,"dogzrule.co.za","einstein","sysadmin",740);
        provider.managers.hostManager.addHost(host);
        let fHost =  provider.managers.hostManager.findValidHost(host,appUser);
        expect(fHost).to.exist;
        provider.managers.hostManager.validHosts=[];
    });

    it("prevent unauthorised users from provisioning hosts for engine", function (done) {
        let appUser = new AppUser("newton",["devops","dev"]);
        let host = new Host(provider,"dogzrule.co.za","einstein","sysadmin",774);
        provider.managers.hostManager.addHost(host);
        provider.managers.hostManager.provisionHostForEngine(host,appUser).then((result)=>{
            provider.managers.hostManager.validHosts=[];
            done(new Error("error - expected an execption"));
        },(err)=>{
            expect(err.message).to.equal("User newton does not have the required permissions for host dogzrule.co.za for the action engine export.");
            provider.managers.hostManager.validHosts=[];
            done();

        }).catch((e)=>{
            provider.managers.hostManager.validHosts=[];
            done(e);
        });
    });


    it("allow authorised users to provisioning hosts for engine", function () {
        let appUser = new AppUser("newton",["sysadmin","dev"]);
        let host = new Host(provider,"dogzrule.co.za","einstein","sysadmin",770);
        provider.engine.export=()=>{
            return true;
        } //mock out engine.
        let func = ()=>{
            provider.managers.hostManager.provisionHostForEngine(host,appUser);
        };
        provider.managers.hostManager.addHost(host);
        expect(func).to.not.throw(Error);
        provider.managers.hostManager.validHosts=[];
    });

});