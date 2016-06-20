/**
 * Created by mark on 2016/04/27.
 */


import LdapAuthw from '../../src/ui/authentication/LdapAuthProvider';
import DBAuth from '../../src/ui/authentication/DBAuthProvider';
import UnixAuth from '../../src/ui/authentication/UnixAuthProvider';
import Provider from '../../src/Provider';
import {expect} from 'chai';

describe("The unix authentication module", ()=> {
    "use strict";

    let provider = new Provider(`${process.cwd()}/conf-example`);
    //provider.init(`${process.cwd()}/conf-example`);

    it("should successfully authenticate user", function (done) {
        this.timeout(10000);
        let auth = new UnixAuth(provider);
        auth.authenticate("vincent", "pass").then((result)=> {
            expect(result).to.be.true;
            done();
        },(err)=>{
                done(err);
            }).catch((e)=>{
            done(e);
        });
    });

    it("should successfully retrieve user groups", function() {
        this.timeout(10000);
        let auth = new UnixAuth(provider);
        expect(auth.getGroups("vincent").length).to.equal(3);
    });
    
/*    it("shouold retrieve users public and pirvate key",function(done){
       let auth = new UnixAuth(provider);
        this.timeout(17000);
       let result =  auth.getKeys("vincent","pass").then((result)=>{
           console.log(result);
           done();
       });
    });*/

});