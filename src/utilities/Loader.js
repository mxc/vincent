/**
 * Created by mark on 2016/02/28.
 */

import Provider from '../Provider';

class Loader {

    constructor(provider){
        if (!provider || !provider instanceof Provider) {
            throw new Error("Parameter provider must be provided for HostGroup.")
        }
        this.errors = [];
        this.provider = provider;
    }
   
    
    
    loadGroups(groupData) {
        this.provider.managers.groupManager.load(groupData, this.errors);
        return this.provider.managers.groupManager.validGroups;
    }

    // loadUsersFromJson(userData) {
    //     this.provider.managers.userManager.loadFromJson(userData, this.errors);
    //     return this.provider.managers.userManager.validUsers;
    // }

    // this.provider.managers.forEach(manager => {
    //             manager.loadFromJson();
    //     });

    loadHosts(hosts) {
        //filter and clean up cloned hosts
        hosts.forEach((hostDef) => {
            try {
                let host = this.provider.managers.hostManager.load(hostDef);
                Array.prototype.push.apply(this.errors, this.provider.managers.hostManager.errors[host.name]);
            }
            catch (e) {
                this.errors.push(e.message);
            }
        });
        return this.provider.managers.hostManager.validHosts;
    }



    loadGroupCategories(groupCategoriesData){
        this.provider.managers.groupManager.groupCategories.load(groupCategoriesData);
    }

    loadSshConfigs(sshConfigsData){
        this.provider.sshConfigs.load(sshConfigsData);
    }

    loadSudoerEntries(sudoerEntriesData){
        this.provider.sudoerEntries.load(sudoerEntriesData);
    }

    includeSSHConfig(host) {
        var sshConfig = Object.assign({}, this.sshConfigs[host.include_ssh_config]);
        delete host["include_ssh_config"];
        host["ssh"] = sshConfig;
    }

    // findValidUser(username, validUsers) {
    //     if (Array.isArray(validUsers)) {
    //         return validUsers.find((item) => {
    //             if (item.name === username) {
    //                 return item;
    //             }
    //         });
    //     } else {
    //         this.errors.push(`failed to search for user ${username} - provided validUsers was not defined`);
    //     }
    // }
    //
    // findValidGroup(groupName, validGroups) {
    //     if (Array.isArray(validGroups)) {
    //         return validGroups.find((item) => {
    //             if (item.name === groupName) {
    //                 return item;
    //             }
    //         });
    //     } else {
    //         this.errors.push(`failed to search for group  ${groupName} - provided validGroups was not defined`);
    //     }
    // }
}

export default Loader;