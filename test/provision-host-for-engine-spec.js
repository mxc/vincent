/**
 * Created by mark on 2016/03/01.
 */
import Provider from "../src/Provider.js";
import User from "../src/modules/user/User";
import UserAccount from "../src/modules/user/UserAccount";
import RemoteAccess from "../src/modules/host/RemoteAccess";
import Host from "../src/modules/host/Host";
import {expect} from 'chai';


describe('When a new host is initialised for the ansible engine it', ()=> {
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
            let host = new Host(provider, "192.168.122.137",'einstein','sysadmin',770);
            let ansibleUser = new User("ansibleAdmin");
            let mark = new User({name: "mark", key: "/home/mark/.ssh/newton/id_rsa.pub"});
            provider.managers.userManager.addValidUser(ansibleUser);
            provider.managers.userManager.addValidUser(mark);
            let ansibleUserAccount = new UserAccount(provider,
                {
                    user: ansibleUser,
                    authorized_keys: [{name: "mark", state: "present"}]
                }
            );
            provider.managers.userManager.addUserAccountToHost(host,ansibleUserAccount);
            provider.managers.sshManager.addSsh(host,"strict");
            host.setRemoteAccess(new RemoteAccess("ansibleAdmin", "password", true));
            //provider.manager.addValidGroup(host);
            provider.managers.hostManager.provisionHostForEngine(host);
            done();
            //provider.engine.runPlaybook(host,(data)=>{ console.log(data); done();},'dagama','dagama');

        })

})

