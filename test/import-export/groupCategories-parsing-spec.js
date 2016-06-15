/**
 * Created by mark on 2016/05/30.
 */

import Provider from '../../src/Provider';
import {expect} from 'chai';
import User from "../../src/modules/user/User";
import UserAccount from "../../src/modules/user/UserAccount";
import Host from "../../src/modules/host/Host";
import Group from "../../src/modules/group/Group";
import HostGroup from "../../src/modules/group/HostGroup";
import fs from "fs";
import path from "path";
import AppUser from '../../src/ui/AppUser';

describe("GroupCategories parsing should", function () {

    let home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    let provider = new Provider(path.resolve(home, "vincenttest"));

    it('load GroupCategories', ()=> {
        var groupcats = [
            {
                "name": "desktop-groups",
                "config": [
                    {
                        "group": {
                            "name": "group1"
                        },
                        "members": [
                            "staff1",
                            "staff2"
                        ]
                    },
                    {
                        "group": {
                            "name": "group2"
                        },
                        "members": [
                            "backup"
                        ]
                    }
                ]
            },
            {
                "name": "server-groups",
                "config": [
                    {
                        "group": {
                            "name": "group3"
                        },
                        "members": [
                            "www-data"
                        ]
                    }
                ]
            }
        ];

        provider.managers.userManager.addValidUser(new User({name: "www-data"}));
        provider.managers.userManager.addValidUser(new User({name: "staff1"}));
        provider.managers.userManager.addValidUser(new User({name: "staff2"}));

        provider.managers.groupManager.addValidGroup(new Group({name: "group1"}));
        provider.managers.groupManager.addValidGroup(new Group({name: "group2"}));

        let groupcategories = provider.managers.groupManager.loadGroupCategoriesFromJson(groupcats);
        expect(groupcategories.categories.length).to.equal(2);
        expect(groupcategories.categories[1].name).to.equal("server-groups");
        expect(groupcategories.categories[0].hostGroups[0].name).to.equal("group1");
    });

    it('export GroupCategories', ()=> {
        //let provider = new Provider();
        provider.managers.userManager.addValidUser(new User("userX"));
        provider.managers.userManager.addValidUser(new User("userY"));
        provider.managers.userManager.addValidUser(new User("userZ"));

        provider.managers.groupManager.clear();
        provider.managers.groupManager.groupCategories.clear();
        provider.managers.groupManager.addValidGroup(new Group({name: "group1"}));
        provider.managers.groupManager.addValidGroup(new Group({name: "group2"}));
        provider.managers.groupManager.addValidGroup(new Group({name: "group3"}));
        provider.managers.groupManager.addValidGroup(new Group({name: "group4"}));

        let hostgroup1 = new HostGroup(provider, {
            group: {name: "group1"},
            members: ["userX", "userY", "userZ"]
        });
        let hostgroup2 = new HostGroup(provider, {
            group: {name: "group2"},
            members: ["userP", "userX"]
        });
        let hostgroup3 = new HostGroup(provider, {
            group: {name: "group3"},
            members: ["userZ", "userX"]
        });
        provider.managers.groupManager.groupCategories.addReplaceGroupCategory("cat3", [hostgroup1, hostgroup2]);
        provider.managers.groupManager.groupCategories.addReplaceGroupCategory("cat2", [hostgroup2, hostgroup3]);
        expect(provider.managers.groupManager.groupCategories.export()).to.deep.equal([
            {
                name: "cat3",
                config: [{
                    group: {name: "group1", state:"present"},
                    members: ["userX", "userY", "userZ"]
                },
                    {
                        group: {name: "group2",state:"present"},
                        members: ["userX"]
                    }
                ]
            },
            {
                name: "cat2",
                config: [{
                    group: {name: "group2", state: "present"},
                    members: ["userX"]
                },
                    {
                        group: {name: "group3", state: "present"},
                        members: ["userZ","userX"]
                    }

                ]
            }]);
    });
});

