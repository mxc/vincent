/**
 * Created by mark on 2016/02/19.
 */
import logger from '../../Logger';
import Provider from '../../Provider';
import fs from 'fs';
import Ssh from '../Ssh';

class SshConfigs {

    constructor(provider) {
        if (!provider || !(provider instanceof Provider)) {
            logger.logAndThrow("Parameter data provider must be of type provider");
        }
        this._state="not loaded";
        this.data = {};
        this.data.configs = {};
    }



    add(sshConfig){
        //todo
    }

    get state(){
        return this._state;
    }

    get configs(){
        return this.data.configs;
    }

    import(sshconfigsData) {
        if (sshconfigsData) {
            this.load(sshconfigsData);
            return;
        }
        let configDir = provider.config.get('confdir');
        fs.readFile(configDir + '/db/includes/ssh-configs.json', (err, data)=> {
            let sshconfigsData = JSON.parse(data);
            try {
                this.load(sshconfigsData);
            } catch (e) {
                logger.warn("Failed to load2 SSH Configs from file system.");
            }
        });
    }

    load(sshconfigsData) {
        sshconfigsData.forEach((sshconfig)=> {
            this.data.configs[sshconfig.name] = sshconfig.config;
            this._state="loaded";
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