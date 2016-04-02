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

    // loadSshConfigs(sshConfigsData){
    //     this.provider.sshConfigs.load(sshConfigsData);
    // }

    loadSudoerEntries(sudoerEntriesData){
        this.provider.sudoerEntries.load(sudoerEntriesData);
    }

    // includeSSHConfig(host) {
    //     var sshConfig = Object.assign({}, this.sshConfigs[host.include_ssh_config]);
    //     delete host["include_ssh_config"];
    //     host["ssh"] = sshConfig;
    // }

}

export default Loader;