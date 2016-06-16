/**
 * Created by mark on 2016/05/31.
 */
import Provider from '../../src/Provider';
import {expect} from 'chai';
import User from "../../src/modules/user/User";
import UserAccount from "../../src/modules/user/UserAccount";
import Host from "../../src/modules/host/Host";
import Group from "../../src/modules/group/Group";
import HostGroup from "../../src/modules/group/HostGroup";
import GroupCategory from "../../src/modules/group/GroupCategory";
import fs from "fs";
import path from "path";
import AppUser from '../../src/ui/AppUser';

describe("GroupCategories API should", function () {

    let provider = new Provider();

    it('allow for the deletion of groupcategories', ()=> {
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
        groupcategories.deleteGroupCategory("server-groups");
        expect(groupcategories.categories.length).to.equal(1);
        groupcategories.clear();
        provider.managers.userManager.clear();
        provider.managers.groupManager.clear();
        console.log(provider.managers.userManager.validUsers);
    });

    it('allow for the addition and replacement of a GroupCategories', ()=> {
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


        let gh1 = new HostGroup(provider,{ group:{ name:"group1"}});
        let gh2 = new HostGroup(provider,{ group:{ name:"group2"}});
        let gc = new GroupCategory("groupcat1",[gh1,gh2]);
        groupcategories.addReplaceGroupCategory("groupcat1",gc);
        expect(groupcategories.categories.length).to.equal(3);
        groupcategories.addReplaceGroupCategory("desktop-groups",[gh1]);
        expect(groupcategories.categories.length).to.equal(3);
        groupcategories.clear();
        provider.managers.groupManager.clear();
    });

});