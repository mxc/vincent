/**
 * Created by mark on 2016/05/31.
 */
"use strict";

import Provider from './../../src/Provider';
import {expect} from 'chai';
import UserAccount from '../../src/modules/user/UserAccount';
import UserCategory from '../../src/modules/user/UserCategory';
import User from '../../src/modules/user/User';


describe("UserCategories API should", function () {

   let provider = new Provider();

    it('allow for deletion of  a UserCategory', ()=> {
        var usercats = [
            {
                "name": "cat3",
                "config": [
                    {
                        "user": {
                            "name": "user2",
                            "state": "present"
                        }
                    },
                    {
                        "user": {
                            "name": "user1",
                            "state": "present"
                        },
                        "authorized_keys": [
                            {"name": "user2", "state": "present"}
                        ]
                    }
                ]
            },
            {
                "name": "cat4",
                "config": [
                    {
                        "user": {
                            "name": "www-data",
                            "state": "present"
                        },
                        "authorized_keys": [
                            {"name": "user1", "state": "present"}
                        ]
                    },
                    {
                        "user": {
                            "name": "postgres",
                            "state": "absent"
                        }
                    }
                ]
            }];
        provider.managers.userManager.addValidUser(new User({name: "user1", key: "xxxx"}));
        provider.managers.userManager.addValidUser(new User({name: "user2", key: "yyyy"}));

        let usercategories = provider.managers.userManager.loadUserCategoriesFromJson(usercats);
        expect(usercategories.categories.length).to.equal(2);
        usercategories.deleteUserCategory("cat3");
        expect(usercategories.categories.length).to.equal(1);
        let cat4 = usercategories.findUserCategory("cat4");
        usercategories.deleteUserCategory(cat4);
        expect(usercategories.categories.length).to.equal(0);
        usercategories.clear();
        provider.managers.userManager.clear();
    });

    it('allow for the addition and replacement of a UserCategories', ()=> {
        var usercats = [
            {
                "name": "cat3",
                "config": [
                    {
                        "user": {
                            "name": "user2",
                            "state": "present"
                        }
                    },
                    {
                        "user": {
                            "name": "user1",
                            "state": "present"
                        },
                        "authorized_keys": [
                            {"name": "user2", "state": "present"}
                        ]
                    }
                ]
            },
            {
                "name": "cat4",
                "config": [
                    {
                        "user": {
                            "name": "www-data",
                            "state": "present"
                        },
                        "authorized_keys": [
                            {"name": "user1", "state": "present"}
                        ]
                    },
                    {
                        "user": {
                            "name": "postgres",
                            "state": "absent"
                        }
                    }
                ]
            }];
        provider.managers.userManager.addValidUser(new User({name: "user1", key: "xxxx"}));
        provider.managers.userManager.addValidUser(new User({name: "user2", key: "yyyy"}));

        let usercategories = provider.managers.userManager.loadUserCategoriesFromJson(usercats);
        expect(usercategories.categories.length).to.equal(2);
        let ua1 = new UserAccount(provider,{ user:{ name:"user1"}});
        let ua2 = new UserAccount(provider,{ user:{ name:"user2"}});
        let uc = new UserCategory("cat5",[ua1,ua2]);
        usercategories.addReplaceUserCategory("cat5",uc);
        expect(usercategories.categories.length).to.equal(3);
        usercategories.addReplaceUserCategory("cat4",[ua1,ua2]);
        expect(usercategories.categories.length).to.equal(3);
        usercategories.clear();
        provider.managers.userManager.clear();
    });

});