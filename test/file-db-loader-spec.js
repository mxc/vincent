/**
 * Created by mark on 2016/02/28.
 */
'use strict';


import Provider from '../src/Provider';
import Loader from "../src/utilities/FileDbLoader";

describe("File DB loader tests", function () {

    let provider = new Provider();
    let loader = new Loader(provider);

    it('should load user categories', (done)=> {
        provider.managers.userManager.loadFromFile().then((result)=> {
            if (result === 'success') {
                expect(provider.managers.userManager.userCategories.configs["staff-user-category"].length).to.equal(2);
                expect(provider.managers.userManager.userCategories.configs["devs-user-category"][0].user.name)
                    .to.equal("dev1");
            }
            done();
        }).catch(e=>{
            console.log(e);
            throw (e);
        });
    });

    it('should load group categories', (done)=> {
        loader.importGroupCategories().then((result)=> {
            if (result === 'success') {
                expect(provider.managers.groupManager.groupCategories.configs["server-groups"].length).to.equal(1);
                expect(provider.managers.groupManager.groupCategories.configs["desktop-groups"][0].group.name)
                    .to.equal("ansible-full");
            }
            done();
        }).catch(e=>{
            console.log(e);
            throw (e);
        });
    });

    it('should load ssh configs', (done)=> {
        loader.importSshConfigs().then((result)=> {
            if (result === 'success') {
                expect(provider.sshConfigs.configs["strict"].permitRoot).to.equal("no");
                expect(provider.sshConfigs.configs["loose"].validUsersOnly)
                    .to.equal("false");
            }
            done();
        }, (error)=> {
            console.log(error);
            expect(error).to.equal("none");
            done();
        });
    });

    it('should load sudoer entries', (done)=> {
        loader.importSudoerEntries().then((result)=> {
            if (result === 'success') {
                expect(provider.sudoerEntries.configs["developers"].commandSpec.cmdList[0])
                    .to.equal("/bin/vi");

                expect(provider.sudoerEntries.configs["backupOperators"].userList.length)
                    .to.equal(1);
            }
            done();
        }, (error)=> {
            console.log(error);
            expect(error).to.equal("none");
            done();
        });
    });


    // Refactor this code as methods are moved out of loader!
    it('should load users hosts and groups', (done)=> {
        loader.importUsersGroupsHosts().then((result)=> {
            done();
        }, (error)=> {
            provider.managers.userManager.loadFromFile().then(result=> {
                expect(provider.managers.userManager.validUsers.length)
                    .to.equal(4);
                expect(provider.managers.groupManager.validGroups.length)
                    .to.equal(3);
                expect(provider.managers.hostManager.validHosts.length).to.equal(3);
                expect(error).to.equal("loadFromJson completed with errors.");
                done();
            });
        }).catch(e=>{
            console.log(e);
            throw (e);
        });
    });
});

