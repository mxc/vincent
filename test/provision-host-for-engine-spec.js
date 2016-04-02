/**
 * Created by mark on 2016/03/01.
 */
import Provider from "../src/Provider.js";
import User from "../src/modules/user/User";
import HostUser from "../src/modules/user/HostUser";
import RemoteAccess from "../src/modules/host/RemoteAccess";
import Host from "../src/modules/host/Host";
import {expect} from 'chai';


describe('When a new host is initialised for the ansible engine', ()=> {
    "use strict";
    it('should generate a playbook that configures the host for pubic key access',
        function (done) {
            this.timeout(15000);
            let provider = new Provider();
            provider.managers.sshManager.loadFromJson([
                {
                    name: "strict",
                    config: {
                        permitRoot: "no",
                        validUsersOnly: "yes",
                        passwordAuthentication: "false"
                    }
                }
            ]);
            let host = new Host(provider, "192.168.122.137");
            let ansibleUser = new User("ansibleAdmin");
            let mark = new User({name: "mark", key: "/home/mark/.ssh/newton/id_rsa.pub"});
            provider.managers.userManager.addValidUser(ansibleUser);
            provider.managers.userManager.addValidUser(mark);
            let ansibleHostUser = new HostUser(provider,
                {
                    user: ansibleUser,
                    authorized_keys: [{name: "mark", state: "present"}]
                }
            );
            provider.managers.userManager.addHostUser(host,ansibleHostUser);
            provider.managers.sshManager.addSsh(host,"strict");
            host.setRemoteAccess(new RemoteAccess("ansibleAdmin", "password", true));
            //provider.manager.addValidGroup(host);
            provider.managers.hostManager.provisionHostForEngine(host);
            done();
            //provider.engine.runPlaybook(host,(data)=>{ console.log(data); done();},'dagama','dagama');

        })

})

