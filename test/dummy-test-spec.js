/**
 * Created by mark on 2016/02/27.
 */
'use strict';


import Provider from '../src/Provider';
import User from "../src/modules/user/User";
import Host from "../src/modules/host/Host";
import HostUser from "../src/modules/user/HostUser";
import Group from "../src/modules/group/Group";
import SshConfigs from "../src/coremodel/includes/SshConfigs";
import UserCategories from "../src/modules/user/UserCategories";
import GroupCategories from "../src/modules/group/GroupCategories";
import AnsibleGenerator from "../src/modules/engines/AnsibleEngine";

describe("***********Test scratchpad", function () {

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

});

describe('Test async loading of dynamic modules', function () {
    it('should  work', (done)=> {
        let provider = new Provider();
        provider.loadManagers().then((result)=>{
            console.log(provider.managers);
            done();
        }).catch(e=>{console.log(e)});
    });
});

describe('Build up host programmaticaly', function () {
    let provider = new Provider();
    let markU = new User({name: "mark", uid: 1000, key: '/home/mark/.ssh/newton/id_rsa.pub'});
    provider.users.add(markU);
    let demoU = new User({name: "demo", uid: 1001});
    provider.users.add(demoU);
    let host = new Host(provider, '192.168.122.137');
    let hostuser1 = new HostUser(provider, {user: demoU});
    hostuser1.addAuthorizedUser(markU, "present");
    host.addHostUser(hostuser1);
    provider.hosts.add(host);
    let ansiblegen = new AnsibleGenerator(provider);
    ansiblegen.loadEngineDefinition(host);
    ansiblegen.export();
    ansiblegen.getInfo(host).then((data)=> {
        //console.log(data);
        done();
    });
});