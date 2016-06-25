/**
 * Created by mark on 2016/06/19.
 */
"use strict";

import Provider from './../../src/Provider';
import {expect} from 'chai';
import UserAccount from '../../src/modules/user/UserAccount';
import User from '../../src/modules/user/User';
import mkdirp from 'mkdirp';


describe("user objects should", function () {
    let home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    let tpath = home + "/" + "vincenttest";
    let provider = new Provider(tpath);

    it("allow user objects to be created from a string user name", function () {
        let user = new User("user1");
        expect(user.name).to.equal("user1");
        expect(user.state).to.equal("present");
        expect(user.key).to.be.undefined;
        expect(user.uid).to.be.undefined;
    });

    it("allow user to be create from a data object", function () {
        let user = new User({name: "user1", state: "absent", uid: 1000});
        expect(user.name).to.equal("user1");
        expect(user.state).to.equal("absent");
        expect(user.key).to.be.undefined;
        expect(user.uid).to.equal(1000);
    });

    it("allow user to be create with an invalid key path but throw excpetion on access", function () {
        let user = new User({
            name: "user1",
            state: "absent",
            uid: 1000,
            key:"./conf-example/db/keys/user1/deleted.pub"
        });
        expect(user.name).to.equal("user1");
        expect(user.state).to.equal("absent");
        expect(user.keyPath).to.equal("./conf-example/db/keys/user1/deleted.pub");
        expect(user.uid).to.equal(1000);
        expect(()=>{
           let key = user.key;
        }).to.throw("Error reading public key for user user1 from file ./conf-example/db/keys/user1/deleted.pub - " +
            "ENOENT: no such file or directory, open '/home/mark/WebstormProjects/ansible-coach/conf-example/" +
            "db/keys/user1/deleted.pub'");
    });

    it("allow a user's public key to be set after creation", function (done) {
        let user = new User("user1");
        expect(user.name).to.equal("user1");
        user.setKey(provider, "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDKXs8/lvhsWY9wkn2V70O+DRVoue1N16KbbZBczrLURVs77IRko" +
            "tH7AH7BUWLlWV+K3umdcO3I59ocu69QWO7q8TQS8dG0mOg0ZO2XOoZaN9aN6ux8jyR/IbtDck5aP+SGSPi3WHdiJM/l1Cxi2FDxHKkN1tDx" +
            "Ur85tWuTvXAYWuqvBQ/gV3t6OihiSv6yWgrb458iymQq2bNkteo2ii3NmIs/k3vxG7mxSaX+/tVXmjP0UsMFDmlE4nlfsKKBC5jPVfiFk4z" +
            "F6ojYlg2CvbdVmIUiUBjLKNl0EDLqfDapXio4tEY6jH2RZeNHW4U1WWyp3F7Z3lFfKSN9IVbzQx2x mark@pc").then((result)=> {
            expect(result).to.equal("Successfully saved public key for user user1.");
            expect(user.keyPath).to.equal(`${tpath}/db/keys/user1/user1_vincent.pub`);
            done();
        }).catch((e)=>{
            console.log(e);
        });

    });

    it("save a user's settings including keys to users.json", function (done) {
        let user = new User("user1");
        expect(user.name).to.equal("user1");
        user.setKey(provider, "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDKXs8/lvhsWY9wkn2V70O+DRVoue1N16KbbZBczrLURVs77IRko" +
            "tH7AH7BUWLlWV+K3umdcO3I59ocu69QWO7q8TQS8dG0mOg0ZO2XOoZaN9aN6ux8jyR/IbtDck5aP+SGSPi3WHdiJM/l1Cxi2FDxHKkN1tDx" +
            "Ur85tWuTvXAYWuqvBQ/gV3t6OihiSv6yWgrb458iymQq2bNkteo2ii3NmIs/k3vxG7mxSaX+/tVXmjP0UsMFDmlE4nlfsKKBC5jPVfiFk4z" +
            "F6ojYlg2CvbdVmIUiUBjLKNl0EDLqfDapXio4tEY6jH2RZeNHW4U1WWyp3F7Z3lFfKSN9IVbzQx2x mark@pc").then((result)=> {
            provider.managers.userManager.addValidUser(user);
            provider.managers.userManager.save();
            provider.managers.userManager.clear();
            provider.managers.userManager.loadFromFile();
            let user1 = provider.managers.userManager.findValidUser("user1");
            expect(user1.keyPath).to.equal(`${tpath}/db/keys/user1/user1_vincent.pub`);
            done();
        }).catch((e)=>{
            console.log(e);
        });

    });

});