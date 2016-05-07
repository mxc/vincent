/**
 * Created by mark on 2016/02/28.
 */
'use strict';


import Provider from '../src/Provider';
import ModuleLoader from '../src/utilities/ModuleLoader';
import {expect} from 'chai';

describe("File DB loader tests", function () {



    let provider = new Provider(`${process.cwd()}/conf-example`);
    //provider.init(`${process.cwd()}/conf-example`);
    
    it('should load user categories', ()=> {
        provider.managers.userCategories.loadFromFile();
        expect(provider.managers.userCategories.configs["staff-user-category"].length).to.equal(2);
        expect(provider.managers.userCategories.configs["devs-user-category"][0].user.name)
            .to.equal("dev1");
    });

    it('should load group categories', ()=> {
        provider.managers.groupCategories.loadFromFile();
        expect(provider.managers.groupCategories.configs["server-groups"].length).to.equal(1);
        expect(provider.managers.groupCategories.configs["desktop-groups"][0].group.name)
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
