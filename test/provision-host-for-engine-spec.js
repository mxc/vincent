/**
 * Created by mark on 2016/03/01.
 */
import Provider from "../src/Provider.js";
import User from "../src/coremodel/User";
import Group from "../src/coremodel/Group";
import HostUser from "../src/coremodel/hostcomponents/HostUser";
import RemoteAccess from "../src/coremodel/hostcomponents/RemoteAccess";
import Host from "../src/coremodel/Host";
import Hosts from "../src/coremodel/collections/Hosts";
import Loader from '../src/utilities/FileDbLoader';


describe('When a new host is initialised for the ansible engine', ()=> {
    "use strict";
    it('should generate a playbook that configures the host for pubic key access',
        function(done) {
        this.timeout(15000);
        let provider = new Provider();
        provider.sshConfigs.load([
            {
                name:"strict",
                config: {
                    permitRoot: "no",
                    validUsersOnly:"yes",
                    passwordAuthentication:"false"
                }
            }
        ]);
        let host = new Host(provider,"192.168.122.137");
        let ansibleUser = new User("ansibleAdmin");
        let mark = new User({name: "mark", key: "/home/mark/.ssh/newton/id_rsa.pub"});
        provider.users.add(ansibleUser);
        provider.users.add(mark);
        let ansibleHostUser = new HostUser(provider,
            {
                user: ansibleUser,
                authorized_keys: [{name: "mark", state: "present"}]
            }
        );
        host.addHostUser(ansibleHostUser);
        host.addSsh("strict");
        host.setRemoteAccess(new RemoteAccess("ansibleAdmin","password",true));
        provider.hosts.add(host);
        provider.hosts.provisionHostForEngine(host);
        provider.engine.runPlaybook(host,(data)=>{ console.log(data); done();},'dagama','dagama');

    })

})

