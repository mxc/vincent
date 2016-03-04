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
        this.provider = provider;
        this.errors =[];
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



    load(sshconfigsData) {
        sshconfigsData.forEach((sshconfig)=> {
            if (!sshconfig.config){
                logger.logAndAddToErrors("Ssh config data must have a property of type 'config' " +
                    "with a valid config definition",this.errors);
            }else {
                this.data.configs[sshconfig.name] = sshconfig.config;
                this._state = "loaded";
            }
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