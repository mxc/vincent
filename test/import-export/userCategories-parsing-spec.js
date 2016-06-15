/**
 * Created by mark on 2016/05/30.
 */

import Provider from '../../src/Provider';
import {expect} from 'chai';
import User from "../../src/modules/user/User";
import UserAccount from "../../src/modules/user/UserAccount";
import Host from "../../src/modules/host/Host";
import Group from "../../src/modules/group/Group";
import fs from "fs";
import path from "path";
import AppUser from '../../src/ui/AppUser';

describe("UserCategories parsing should", function () {

    let home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    let provider = new Provider(path.resolve(home, "vincenttest"));

    it('load UserCategories', ()=> {
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
        provider.managers.userManager.addValidUser(new User({name:"user1",key:"xxxx"}));
        provider.managers.userManager.addValidUser(new User({name:"user2",key:"yyyy"}));

        let usercategories = provider.managers.userManager.loadUserCategoriesFromJson(usercats);
        expect(usercategories.categories.length).to.equal(2);
        expect(usercategories.categories[0].userAccounts.length).to.equal(2);
        expect(usercategories.categories[1].userAccounts[0].authorized_keys[0].name).to.equal("user1");
    });

    it('export UserCategories', ()=> {
        //let provider = new Provider();
        provider.managers.userManager.addValidUser(new User("userX"));
        provider.managers.userManager.addValidUser(new User("userY"));
        provider.managers.userManager.addValidUser(new User("userZ"));

        let ua1 = [new UserAccount(provider, {user: {name: "userX"}}),
            new UserAccount(provider, {user: {name: "userY"}})
        ];

        let ua2 = [new UserAccount(provider, {user: {name: "userZ"}})];

        provider.managers.userManager.userCategories.clear();
        provider.managers.userManager.userCategories.addReplaceUserCategory("cat3", ua1);
        provider.managers.userManager.userCategories.addReplaceUserCategory("cat2", ua2);
        expect(provider.managers.userManager.userCategories.export()).to.deep.equal(
            [
                {
                    name: 'cat3',
                    config: [
                        {
                            "user":{
                                name: "userX",
                                state: "present"
                            }
                        },
                        {
                           "user":{
                               name: "userY",
                               state:"present"
                           }
                        }
                    ]
                },
                {
                    name: 'cat2',
                    config: [
                        {
                            user:{
                                name: 'userZ',
                                state:"present"
                            }
                        }
                    ]
                }
            ]
        );
    });
});