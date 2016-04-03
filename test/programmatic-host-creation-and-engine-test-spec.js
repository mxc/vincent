/**
 * Created by mark on 2016/02/27.
 */
'use strict';


import Provider from '../src/Provider';
import User from "../src/modules/user/User";
import Host from "../src/modules/host/Host";
import HostUser from "../src/modules/user/HostUser";
import Group from "../src/modules/group/Group";
import AnsibleGenerator from "../src/modules/engines/AnsibleEngine";
import {expect} from 'chai';
import fs from 'fs';


describe("The system", function () {

    var validUsers = [
        new User({name: 'user1', key: 'user1.pub', state: 'present', uid: undefined}),
        new User({name: 'user2', key: undefined, state: 'absent', uid: undefined}),
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

    var userCategories = [
        {
            "name": "cat1",
            "config": [
                {
                    user: {
                        name: "user1",
                        state: "absent"
                    },
                    authorized_keys: [
                        {name: "user2"},
                        {name: "user1"}]
                },
                {user: {name: "user2"}}
            ]
        },
        {
            "name": "cat2",
            "config": [
                {user: {name: "user3", state: "present"}},
                {user: {name: "user1"}, authorized_keys: [{name: "user2"}, {name: "user1"}]}
            ]
        }
    ];


//TODO - Need to wait for es2015 dynamic module loading to land
// describe('Test async loading of dynamic modules', function () {
//     it('should  work', (done)=> {
//         let provider = new Provider();
//         provider.createManagers().then((result)=>{
//             //console.log(provider.managers);
//             done();
//         }).catch(e=>{console.log(e)});
//     });
// });

    let provider = new Provider();
    let ansiblegen = new AnsibleGenerator(provider);

    beforeEach(()=> {
        ansiblegen.clean();
        provider.clear();
        let markU = new User({name: "mark", uid: 1000, key: '/home/mark/.ssh/newton/id_rsa.pub'});
        provider.managers.userManager.addValidUser(markU);
        let demoU = new User({name: "demo", uid: 1001});
        provider.managers.userManager.addValidUser(demoU);
        let host = new Host(provider, '192.168.122.137');
        let hostuser1 = new HostUser(provider, {user: demoU});
        hostuser1.addAuthorizedUser(markU, "present");
        provider.managers.userManager.addHostUser(host, hostuser1);
        provider.managers.hostManager.add(host);
    });


    it('should successfully allow a user to build a host definition programmaticaly', function () {
        ansiblegen.loadEngineDefinition(provider.managers.hostManager.validHosts[0]);
        ansiblegen.export().then(result=> {
            let filename = path.resolve(gen.playbookDir, "inventory");
            let promise = new Promise((resolve)=> {
                fs.stat(filename, (err, stats)=> {
                    expect(stats.isFile()).to.be.true();
                });
            });
            promise.then(result=> {
                let filename = path.resolve(gen.playbookDir, "192.168.12.137.yml");
                fs.stat(filename, (err, stats)=> {
                    expect(stats.isFile()).to.be.true();
                    done();
                });
            });
        });

        // ansiblegen.getInfo(host).then((data)=> {
        //     //console.log(data);
        //     done();
        // });
    });

});