/**
 * Created by mark on 2016/02/21.
 */
import Provider from "../../src/Provider";
import User from "../../src/modules/user/User";
import Group from "../../src/modules/group/Group";
import {expect} from 'chai';
import fs from 'fs';
import Docker from '../support/Docker'
import path from 'path';
import AppUser from '../../src/ui/AppUser';
import Host from '../../src/modules/host/Host';


describe("ansible engine", () => {
    "use strict";

    var validUsers = [
        new User({name: 'userA', key: 'userA.pub', state: 'present', uid: undefined}),
        new User({name: 'userB', key: undefined, state: 'absent', uid: undefined}),
        new User({name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'}),
        new User({name: 'user4', key: undefined, state: 'present', uid: undefined})
    ];

    var validGroups = [
        new Group({

            name: 'group1',
            gid: undefined,
            state: 'present'
        }),
        new Group({
            name: 'group2',
            gid: undefined,
            state: 'present'
        }),
        new Group({
            name: 'group3',
            gid: 1000,
            state: 'present'
        })
    ];

    var validHosts = [
        {
            name: "www.example.com",
            owner: 'einstein',
            group: 'sysadmin',
            permissions: 770,
            configGroup: "default",
            users: [
                {
                    user: {name: "userA", state: "present"},
                    authorized_keys: [{name: "userA", state: "present"}]
                },
                {
                    user: {name: "userB", state: "absent"},
                    authorized_keys: [{name: "userA", state: "present"}]
                }
            ],
            groups: [
                {
                    group: {name: "group1", state: "present"},
                    members: [
                        "user1"
                    ]
                },
                {
                    group: {name: "group2", state: "present"}
                },
                {
                    group: {name: "group3", state: "present"},
                    members: [
                        "user1"
                    ]
                }

            ]
        }];
    let appUser = new AppUser("einstien", ["sysadmin"]);
    let home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    let provider = new Provider(path.resolve(home, "vincenttest"));
    var gen = provider.engine;
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    provider.managers.hostManager.loadHosts(validHosts);
    //make sure directory is empty before running tests.
    it("it should have empty directory once clean has been called", (done)=> {
        gen.clean().then(result=> {
            let dir = provider.getEngineDir() + "/playbooks";
            let files = fs.readdirSync(dir);
            expect(files.length).to.equals(0);
            done();
        }).catch(e=> {
            console.log(e);
            expect(e.message).to.equal("no files to delete.");
            done();
        });
    });


    it("should generate a playbook for the host", (done) => {
        let host = provider.managers.hostManager.findValidHost("www.example.com", "default");
        gen.loadEngineDefinition(host, appUser);
        gen.export(host).then((result)=> {
            expect(result).to.equal("success");
            let playbookObj = gen.playbooks["www.example.com"];
            expect(playbookObj.default.yml).to.contain("- hosts: www.example.com");
            gen.clean();
            done();
        }).catch(e=> {
            console.log(e);
            done();
            throw new Error(e);
        });
    });

    it("should generate playbook files for host", function (done) {
        let host = provider.managers.hostManager.findValidHost("www.example.com", "default");
        gen.loadEngineDefinition(host, appUser);
        gen.clean().then(result=> {
            gen.export(host).then((result)=> {
                fs.readdir(gen.playbookDir, (err, files)=> {
                    expect(files.length).to.equal(2);
                    done();
                })
            })
        }).catch(e=> {
            console.log(e);
            throw new Error(e);
        });
    });

    it("should get ansible facts using ssh key authentication", function (done) {
        let docker = new Docker();
        let running = false;
        this.timeout(17000);
        docker.startDocker("vincentsshkeys").then(ipaddr=> {
            running = true;
            let host = new Host(provider, ipaddr, "einstein", "sysadmin", 770);
            provider.managers.hostManager.addHost(host);
            let keypath = path.resolve(provider.getRootDir(), "test/docker/sshkeys/vincent.key");
            return gen.getInfo(host, false, keypath, "vincent").then((result)=> {
                expect(result.ansible_system).to.equal("yes");
            });
        }).then(result => {
            return docker.stopDocker();
        }).then(result=> {
            gen.clean();
            provider.managers.hostManager.validHosts = [];
            done();
        }).catch(e=> {
            if (running) {
                provider.managers.hostManager.validHosts = [];
                docker.stopDocker().then(console.log(e));
                done();
            } else {
                console.log(e);
                provider.managers.hostManager.validHosts = [];
                done();
            }
        });
    });

    it("should get ansible facts using password and sudo password", function (done) {
        let docker = new Docker();
        let running = false;
        this.timeout(25000);
        docker.startDocker("vincentsshpasswd").then(ipaddr=> {
            running = true;
            let host = new Host(provider, ipaddr, "einstein", "sysadmin", 770);
            provider.managers.hostManager.addHost(host);
            return gen.getInfo(host, false, undefined, "vincent", "pass", "pass");
        }).then((result)=> {
            expect(result.includes('ansible_facts')).to.be.true;
        }).then(result => {
            return docker.stopDocker();
        }).then(result=> {
            gen.clean();
            provider.managers.hostManager.validHosts = [];
            done();
        }).catch(e=> {
            if (running) {
                docker.stopDocker().then(console.log(e));
            } else {
                console.log(e);
            }
            done();
        });
    });
});