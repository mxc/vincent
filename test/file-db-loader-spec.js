/**
 * Created by mark on 2016/02/28.
 */
'use strict';


import Provider from '../src/Provider';
import ModuleLoader from '../src/utilities/ModuleLoader';
import {expect} from 'chai';
import User from '../src/modules/user/User';

describe("File DB loader tests", function () {



    let provider = new Provider(`${process.cwd()}/conf-example`);
    //provider.init(`${process.cwd()}/conf-example`);


    it('should load user categories', ()=> {
        var validUsers = [
            new User({name: 'www-data', key: 'www-data.pub', state: 'present', uid: undefined}),
            new User({name: 'postgres', key: undefined, state: 'absent', uid: undefined}),
            new User({name: 'dev1', key: 'dev1.pub', uid: 1000, state: 'present'}),
        ];

        provider.managers.userManager.validUsers = validUsers;

        provider.managers.userCategories.loadFromFile();
        expect(provider.managers.userCategories.findUserCategory("staff-user-category").userAccounts.length).to.equal(0);
        expect(provider.managers.userCategories.findUserCategory("app-services-user-category").userAccounts.length).to.equal(2);
        expect(provider.managers.userCategories.findUserCategory("devs-user-category").userAccounts[0].user.name)
            .to.equal("dev1");
        provider.managers.userManager.validUsers = [];
    });

    it('should load group categories', ()=> {
        provider.managers.groupCategories.loadFromFile();
        expect(provider.managers.groupCategories.findGroupCategory("server-groups").hostGroups.length).to.equal(1);
        expect(provider.managers.groupCategories.findGroupCategory("desktop-groups").hostGroups[0].group.name)
            .to.equal("ansible-full");
    });

    it('should load ssh configs', ()=> {
        provider.managers.sshManager.loadFromFile();
        expect(provider.managers.sshManager.configs["strict"].permitRoot).to.equal("no");
        expect(provider.managers.sshManager.configs["loose"].validUsersOnly)
            .to.equal("false");
    });

    it('should load sudoer entries', ()=> {
        provider.managers.sudoManager.loadFromFile();
        expect(provider.managers.sudoManager.configs["developers"].commandSpec.cmdList[0])
            .to.equal("/bin/vi");
        expect(provider.managers.sudoManager.configs["backupOperators"].userList.length)
            .to.equal(1);
    });


    it('should load user entries', ()=> {
        provider.managers.userManager.loadFromFile();
        expect(provider.managers.userManager.validUsers.length)
            .to.equal(4);
    });

    it('should load group entries', ()=> {
        provider.managers.groupManager.validGroups=[];
        provider.managers.groupManager.loadFromFile();
        expect(provider.managers.groupManager.validGroups.length)
            .to.equal(3);
    });


// Refactor this code as methods are moved out of loader!
    it('should load hosts', ()=> {
        ModuleLoader.managerOrderedIterator((managerClass)=> {
            provider.getManagerFromClassName(managerClass).loadFromFile();
        }, provider);
        expect(provider.managers.hostManager.validHosts.length).to.equal(3);
    });
});
