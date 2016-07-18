/**
 * Created by mark on 2016/02/28.
 */
'use strict';


import Provider from '../../src/Provider';
import ModuleLoader from '../../src/utilities/ModuleLoader';
import {expect} from 'chai';
import User from '../../src/modules/user/User';
import Group from '../../src/modules/group/Group';

describe("File DB loader tests", function () {


    let provider = new Provider(`${process.cwd()}/conf-example`);
    //provider.init(`${process.cwd()}/conf-example`);


    it('should load ssh configs', ()=> {
        provider.managers.sshManager.loadFromFile();
        expect(provider.managers.sshManager.configs["strict"].permitRoot).to.equal("no");
        expect(provider.managers.sshManager.configs["loose"].validUsersOnly)
            .to.equal("false");
    });

    it('should load sudoer entries', ()=> {
        provider.managers.userManager.addValidUser(new User("user3"));
        provider.managers.userManager.addValidUser(new User("user1"));
        provider.managers.groupManager.addValidGroup(new Group("group1"));
        provider.managers.sudoManager.loadFromFile();
        expect(provider.managers.sudoManager.configs["developers"].commandSpec.cmdList[0])
            .to.equal("/bin/vi");
        expect(provider.managers.sudoManager.configs["backupOperators"].userList.users.length)
            .to.equal(1);
    });


    it('should load user entries', ()=> {
        provider.managers.userManager.loadFromFile();
        expect(provider.managers.userManager.validUsers.length)
            .to.equal(4);
    });

    it('should load group entries', ()=> {
        provider.managers.groupManager.validGroups = [];
        provider.managers.groupManager.loadFromFile();
        expect(provider.managers.groupManager.validGroups.length)
            .to.equal(3);
    });


    it('should load hosts', ()=> {
            provider.loader.callFunctionInTopDownOrder((managerClass)=> {
                provider.getManagerFromClassName(managerClass).loadFromFile();
            });
        expect(provider.managers.hostManager.validHosts.length).to.equal(3);
    });
});
