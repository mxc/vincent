/**
 * Created by mark on 2016/02/28.
 */
'use strict';


import Provider from '../src/Provider';
import User from "../src/coremodel/User";
import Host from "../src/coremodel/Host";
import HostUser from "../src/coremodel/hostcomponents/HostUser";
import Group from "../src/coremodel/Group";
import SshConfigs from "../src/coremodel/includes/SshConfigs";
import UserCategories from "../src/coremodel/includes/UserCategories";
import GroupCategories from "../src/coremodel/includes/GroupCategories";
import Loader from "../src/utilities/FileDbLoader";

describe("File DB loader tests", function () {

    let provider = new Provider();
    let loader = new Loader(provider);

    it('should load user categories', (done)=> {
        loader.importUserCategories().then((result)=> {
            if (result === 'success') {
                expect(provider.userCategories.configs["staff-user-category"].length).to.equal(2);
                expect(provider.userCategories.configs["devs-user-category"][0].user.name)
                    .to.equal("dev1");
            }
            done();
        }, (error)=> {
            expect(error).to.equal(undefined);
            done();
        });
    });

    it('should load group categories', (done)=> {
        loader.importGroupCategories().then((result)=> {
            if (result === 'success') {
                expect(provider.groupCategories.configs["server-groups"].length).to.equal(1);
                expect(provider.groupCategories.configs["desktop-groups"][0].group.name)
                    .to.equal("ansible-full");
            }
            done();
        }, (error)=> {
            expect(error).to.equal("None");
            done();
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


    it('should load users hosts and groups', (done)=> {
        loader.importUsersGroupsHosts().then((result)=> {
            if (result === 'success') {

            }
            done();
        }, (error)=> {
            expect(provider.users.validUsers.length)
                .to.equal(4);
            expect(provider.groups.validGroups.length)
                .to.equal(3);
            expect(provider.hosts.validHosts.length).to.equal(3);
            expect(error).to.equal("load completed with errors.");
            done();
        });
    });

})
;

