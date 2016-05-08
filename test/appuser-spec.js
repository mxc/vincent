/**
 * Created by mark on 2016/05/08.
 */
import AppUser from '../src/ui/AppUser';
import {expect} from 'chai';

describe("AppUser should", ()=> {


    it("properly create an AppUser object in instantiation", ()=> {
         let user = new AppUser("einstein");
         expect(user.name).to.deep.equal("einstein");
         expect(user.groups).to.deep.equal(["einstein"]);
         expect(user.primaryGroup).to.equal("einstein");

        user  = new AppUser("einstein",["sysadmin","devops"]);
        expect(user.name).to.deep.equal("einstein");
        expect(user.groups).to.deep.equal(["sysadmin","devops"]);
        expect(user.primaryGroup).to.equal("sysadmin");

        user  = new AppUser("einstein",["sysadmin","devops"],"devops");
        expect(user.name).to.deep.equal("einstein");
        expect(user.groups).to.deep.equal(["sysadmin","devops"]);
        expect(user.primaryGroup).to.equal("devops");

        user  = new AppUser("einstein",["sysadmin","devops"],"audit");
        expect(user.name).to.deep.equal("einstein");
        expect(user.groups).to.deep.equal(["sysadmin","devops","audit"]);
        expect(user.primaryGroup).to.equal("audit");

    });

    it("prevent changes to  AppUser object after instantiation", ()=> {
        let user  = new AppUser("einstein",["sysadmin","devops"],"audit");
        expect(user.name).to.deep.equal("einstein");
        expect(user.groups).to.deep.equal(["sysadmin","devops","audit"]);
        expect(user.primaryGroup).to.equal("audit");

        let func = ()=>{
            let appUser = new AppUser();
        };
        expect(func).to.throw("The parameter name is mandatory and must be a username string");


        func = ()=>{
            user.name="newton";
        };
        expect(func).to.throw("Cannot assign to read only property 'name' of #<AppUser>");

        func = ()=>{
            user.primaryGroup = "newPirmary";
        };
        expect(func).to.throw("Cannot assign to read only property 'primaryGroup' of #<AppUser>");

        func = ()=>{
            user.groups = ["alpha"];
        };
        expect(func).to.throw("Cannot assign to read only property 'groups' of #<AppUser>");

        func = ()=>{
            user.groups.push("alpah");
        };
        expect(func).to.throw("Can't add property 3, object is not extensible");


    });


});