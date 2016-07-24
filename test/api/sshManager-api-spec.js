/**
 * Created by mark on 2016/07/24.
 */
"use strict";

import Provider from './../../src/Provider';
import {expect} from 'chai';
import UserAccount from '../../src/modules/user/UserAccount';
import Host from '../../src/modules/host/Host';
import User from '../../src/modules/user/User';
import Group from '../../src/modules/group/Group';
import HostGroup from '../../src/modules/group/HostGroup';


describe("SSHManager API should", function () {

    var sshConfigs = {
        owner: "einstein",
        group: "sysadmin",
        permissions: "770",
        configs: [
            {
                name: "strict",
                config: {
                    permitRoot: "no",
                    validUsersOnly: "true",
                    passwordAuthentication: "no"
                }
            },
            {
                name: "strict_with_root",
                config: {
                    permitRoot: "without-password",
                    validUsersOnly: "true",
                    passwordAuthentication: "no"
                }
            },
            {
                name: "loose",
                config: {
                    permitRoot: "yes",
                    validUsersOnly: "false",
                    passwordAuthentication: "yes"
                }
            }
        ]
    };



    let provider = new Provider();
    //inject mocks
    provider.managers.sshManager.loadFromJson(sshConfigs);


    it("allow new ssh config templates to be added", function () {
        var sshConfigs2 = {
            owner: "einstein",
            group: "sysadmin",
            permissions: "770",
            configs: [
                {
                    name: "strict",
                    config: {
                        permitRoot: false,
                        validUsersOnly: true,
                        passwordAuthentication: false
                    }
                },
                {
                    name: "strict_with_root",
                    config: {
                        permitRoot: "without-password",
                        validUsersOnly: true,
                        passwordAuthentication: false
                    }
                },
                {
                    name: "loose",
                    config: {
                        permitRoot: true,
                        validUsersOnly: false,
                        passwordAuthentication: true
                    }
                },
                {
                    name:"test",
                    config:{
                        permitRoot: true,
                        validUsersOnly: false,
                        passwordAuthentication: false
                    }
                }
            ]
        };
        provider.managers.sshManager.addConfig("test",{permitRoot:true, passwordAuthentication:false, validUsersOnly:false});
        expect(provider.managers.sshManager.export()).to.deep.equal(sshConfigs2);
    });

    it("allow ssh config templates to be deleted", function () {
        var sshConfigs2 = {
            owner: "einstein",
            group: "sysadmin",
            permissions: "770",
            configs: [
                {
                    name: "strict",
                    config: {
                        permitRoot: false,
                        validUsersOnly: true,
                        passwordAuthentication: false
                    }
                },
                {
                    name: "strict_with_root",
                    config: {
                        permitRoot: "without-password",
                        validUsersOnly: true,
                        passwordAuthentication: false
                    }
                }]
        };
        provider.managers.sshManager.removeConfig("loose");
        provider.managers.sshManager.removeConfig("test");
        expect(provider.managers.sshManager.export()).to.deep.equal(sshConfigs2);
    });


});