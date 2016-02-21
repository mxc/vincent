/**
 * Created by mark on 2016/02/19.
 */
import logger from '../../utilities/Logger';
import Provider from '../../utilities/Provider';
import fs from 'fs';
import Ssh from '../Ssh';

class SshConfigs {

    constructor(provider, sshconfigsData) {

        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }

        this.data = {};
        this.data.configs = {};
        if (!sshconfigsData) {
            sshconfigsData = JSON.parse(fs.readFileSync(provider.configdir + '/includes/ssh-configs.json'));
        }

        sshconfigsData.forEach((sshconfig)=> {
            this.data.configs[sshconfig.name] = sshconfig.config;
        });

    }

    find(name) {
        return this.data.configs[name];
    }

    clear() {
        this.data.configs = [];
    }
}

export default SshConfigs;