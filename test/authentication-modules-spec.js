/**
 * Created by mark on 2016/04/27.
 */


import LdapAuthw from '../src/ui/authentication/LdapAuthProvider';
import DBAuth from '../src/ui/authentication/DBAuthProvider';
import UnixAuth from '../src/ui/authentication/UnixAuthProvider';
import Provider from '../src/Provider';
import {expect} from 'chai';

describe("The unix authenication module ", ()=> {
    "use strict";
    let provider = new Provider(`${process.cwd()}/conf-example`);

    it("should successfully authenticate user", function (done) {
        //  let docker = new Docker();
        //  docker.startDocker("vincentsshkeys").then((ipaddr)=> {
        this.timeout(20000);
        let auth = new UnixAuth(provider);
        auth.authenticate("vincent", "pass").then((result)=> {
            expect(result).to.be.true;
            done();
        },(err)=>{
                done(err);
            }).catch((e)=>{
            done(e);
        });
        //});
    });

    it("should successfully retrieve user groups", function(done) {
        this.timeout(10000);
        let auth = new UnixAuth(provider);
        auth.authenticate("vincent", "pass").then((result)=> {
            expect(auth.getGroups().length).to.equal(3);
            done();
        },(err)=>{
            done(err);
        }).catch((e)=>{
            done(e);
        });
    });

});