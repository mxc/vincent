/**
 * Created by mark on 2016/04/30.
 */
import Provider from '../src/Provider';
import {expect} from 'chai';
import AppUser from '../src/ui/AppUser';
import Host from '../src/modules/host/Host';

describe("Permissions handling functions", ()=> {
    "use strict";
    let provider = new Provider(`${process.cwd()}/conf-example`);

    it("should correctly validate correct string permissions rwxrw----", function () {
            let perms = provider._validateAndConvertPermissions("rwxrw----");
            expect(perms).to.equal(parseInt("760",8));
    });

    it("should correctly validate correct int permissions (as octal) 760", function () {
        let perms = provider._validateAndConvertPermissions(760);
        expect(perms).to.equal(parseInt("760",8));
    });


    it("should correctly calculate integer value for 3 character permission string",()=>{

        let result = provider. _permStringToInteger("---");
        expect(result).to.equal(0);

        result = provider. _permStringToInteger("--x");
        expect(result).to.equal(1);

        result = provider. _permStringToInteger("-w-");
        expect(result).to.equal(2);


        result = provider. _permStringToInteger("-wx");
        expect(result).to.equal(3);


        result = provider. _permStringToInteger("r--");
        expect(result).to.equal(4);

        result = provider. _permStringToInteger("r-x");
        expect(result).to.equal(5);


        result = provider. _permStringToInteger("rw-");
        expect(result).to.equal(6);

        result = provider. _permStringToInteger("rwx");
        expect(result).to.equal(7);
    });


    it("should correctly calculate integer value for single character permissions",()=>{

        let result = provider. _permStringToInteger("x");
        expect(result).to.equal(1);

        result = provider. _permStringToInteger("w");
        expect(result).to.equal(2);

        result = provider. _permStringToInteger("r");
        expect(result).to.equal(4);
    });


    it("should throw an exception for an invalid character permission string",()=>{

        var func  = ()=>{ provider. _permStringToInteger("z") };
        expect(func).to.throw(Error);

        func  = ()=>{ provider. _permStringToInteger("www") };
        expect(func).to.throw(Error);

        func  = ()=>{  provider. _permStringToInteger("rwx-") };
        expect(func).to.throw(Error);
    });


    it("should convert a valid interger (<=7) to a character permission string",()=>{

        let result = provider._singleIntegerToOctalString(7);
        expect(result).to.equal("rwx");

        result = provider._singleIntegerToOctalString(6);
        expect(result).to.equal("rw-");

        result = provider._singleIntegerToOctalString(5);
        expect(result).to.equal("r-x");

        result = provider._singleIntegerToOctalString(4);
        expect(result).to.equal("r--");

        result = provider._singleIntegerToOctalString(3);
        expect(result).to.equal("-wx");

        result = provider._singleIntegerToOctalString(2);
        expect(result).to.equal("-w-");

        result = provider._singleIntegerToOctalString(1);
        expect(result).to.equal("--x");

        result = provider._singleIntegerToOctalString(0);
        expect(result).to.equal("---");

    });

    it("should throw an exception when asked to convert an invalid integer to permission character string",()=>{

        var func  = ()=>{ provider._singleIntegerToOctalString(8); };
        expect(func).to.throw(Error);

        func  = ()=>{ provider._singleIntegerToOctalString(-1);  };
        expect(func).to.throw(Error);

        func  = ()=>{  provider._singleIntegerToOctalString(740);  };
        expect(func).to.throw(Error);
    });

    it("should grant access to users with correct permissions",()=>{

        let host = new Host(provider, '192.168.122.137','einstein','sysadmin',700);
        let user = new AppUser("einstein",["sysadmin","ops","auditor"]);
        expect(provider.checkPermissions(user,host,"r")).to.be.true;
        expect(provider.checkPermissions(user,host,"w")).to.be.true;
        expect(provider.checkPermissions(user,host,"x")).to.be.true;

        host = new Host(provider, '192.168.122.137','newton','sysadmin',770);
        expect(provider.checkPermissions(user,host,"r")).to.be.true;
        expect(provider.checkPermissions(user,host,"w")).to.be.true;
        expect(provider.checkPermissions(user,host,"x")).to.be.true;

        host = new Host(provider, '192.168.122.137','newton','root',707);
        expect(provider.checkPermissions(user,host,"r")).to.be.true;
        expect(provider.checkPermissions(user,host,"w")).to.be.true;
        expect(provider.checkPermissions(user,host,"x")).to.be.true;


        host = new Host(provider, '192.168.122.137','einstein','sysadmin',233);
        console.log(provider._integerToOctalString(host.permissions));
        expect(provider.checkPermissions(user,host,"r")).to.be.false;
        expect(provider.checkPermissions(user,host,"w")).to.be.true;
        expect(provider.checkPermissions(user,host,"x")).to.be.true;


        host = new Host(provider, '192.168.122.137','newton','sysadmin',700);
        expect(provider.checkPermissions(user,host,"r")).to.be.false;
        expect(provider.checkPermissions(user,host,"w")).to.be.false;
        expect(provider.checkPermissions(user,host,"x")).to.be.false;


        host = new Host(provider, '192.168.122.137','newton','sysadmin',710);
        expect(provider.checkPermissions(user,host,"r")).to.be.false;
        expect(provider.checkPermissions(user,host,"w")).to.be.false;
        expect(provider.checkPermissions(user,host,"x")).to.be.true;

    });


});