/**
 * Created by mark on 2016/02/28.
 */


import Database from '../src/utilities/Database';
import Provider from '../src/Provider';
import {expect} from 'chai';

describe("Database utility tests", ()=> {
    "use strict";
    let provider = new Provider(`${process.cwd()}/conf-example`);

    it("should successfully create database tables", (done)=> {
        let db = new Database(provider);
        db.createTables().then((result)=> {
                expect(result).to.equal("Successfully created indices on tables.");
                done();
        }).catch((e)=> {
            console.log(e.message);
            throw e;
            done();
        });
    });

    it("should successfully drop database tables",(done)=>{
        let db = new Database(provider);
        db.dropTables().then((result)=> {
            expect(result).to.equal("Successfully dropped database tables.");
            done();
        }).catch((e)=> {
            console.log(e.message);
            throw e;
            done();
        });
    });
});