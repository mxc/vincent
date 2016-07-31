'use strict';

import RemoteAccess from './RemoteAccess';
import Provider from '../../Provider';
import {logger} from '../../Logger';
import Base from '../../modules/base/Base';
import User from '../user/User';
import AppUser from '../../ui/AppUser';
import _ from 'lodash';
import HostComponent from './../base/HostComponent';
import HostComponentContainer from '../base/HostComponentContainer';

class Host  {

    constructor(provider, dataOrName, owner, group, permissions, configGroup,osFamily) {
        this.errors = [];
        this.deleted={};
        if (!provider || !(provider instanceof Provider)) {
            throw new Error("Parameter provider must be provided for Host.")
        }
        this.provider = provider;
        this.data={};
        //check if we were provided with a host name or a data object
        if (typeof dataOrName === 'string') {
            this.name = dataOrName;
            //if(!owner  || !group){
            //    logger.logAndThrow(`${data} requires a valid owner and group.`);
            //}
            this.owner = owner;
            this.group = group;
            this.permissions = permissions ? permissions : "660";
            this.osFamily=osFamily? osFamily: "unknown";
            //avoid init fields problem for detecting changes in name/configGroup
            this.data.configGroup = configGroup ? configGroup : "default";
        } else if (typeof dataOrName === 'object') {
            if (!dataOrName.name) {
                logger.logAndThrow(`The parameter data must be a hostname or an object with a mandatory property "name".`);
            }
            this.name=dataOrName.name;
            this.owner = dataOrName.owner;
            this.group = dataOrName.group;
            this.permissions = dataOrName.permissions ? dataOrName.permissions : "660";
            this.osFamily=dataOrName.osFamily? dataOrName.osFamily: "unknown";
            //avoid init fields problem for detecting changes in name/configGroup
            this.data.configGroup = dataOrName.configGroup ? dataOrName.configGroup : "default";
        }

        //configure remoteAccess settings for host.
        if (dataOrName.remoteAccess) {
            try {
                let remoteAccessDef = dataOrName.remoteAccess;
                let remoteAccess = new RemoteAccess(remoteAccessDef.remoteUser,
                    remoteAccessDef.authentication, remoteAccessDef.becomeUser,remoteAccessDef.sudoAuthentication);
                this.data.remoteAccess = remoteAccess;
            } catch (e) {
                console.log(e);
                logger.logAndAddToErrors(`Error adding remote access user - ${e.message}`,
                    this.errors);
            }
        }
        this.data.configs = new HostComponentContainer("configs");
    }

    set name(name) {
        if(this.data.name && !this.deleted.configGroup && !this.deleted.name){
            this.deleted.name=this.data.name;
            this.deleted.configGroup = this.configGroup;
        }
        var validip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
        var validhostname = /(\w\.)+\w/;
        if (!validip.test(name) && !validhostname.test(name)) {
            logger.logAndThrow(`${name} is an invalid host name`);
        } else {
            this.data.name = name;
        }
    }

    get owner() {
        return this.data.owner;
    }

    get group() {
        return this.data.group;
    }

    get permissions() {
        return this.data.permissions;
    }

    get osFamily(){
        return this.data.osFamily;
    }

    //todo check if this is a valid user?
    set owner(owner) {
        if (typeof owner === 'string') {
            this.data.owner = owner;
        } else if (owner instanceof User) {
            this.data.owner = owner.name;
        } else {
            logger.logAndThrow("Owner must be a username or object of type User.");
        }
    }

    set group(group) {
        if (typeof group === "string") {
            this.data.group = group;
        } else {
            logger.logAndThrow("Group must be a string.");
        }
    }

    //perms must be a 9 character string (rwx){3} or a 3 digit octal. Any integer is assumes to be a octal.
    set permissions(perms) {
        if (!perms) {
            logger.logAndThrow("Permissions cannot be undefined.");
        }
        let dperms = this.provider._validateAndConvertPermissions(perms);
        this.data.permissions = dperms;
    }

    set osFamily(osFamily){
            this.data.osFamily=osFamily;
    }

    get configGroup() {
        return this.data.configGroup;
    }

    get configs(){
        return this.data.configs;
    }

    set configGroup(configGroup) {
        if(this.data.name && !this.deleted.configGroup && !this.deleted.name){
            this.deleted.name=this.data.name;
            this.deleted.configGroup = this.data.configGroup;
        }
        this.data.configGroup = configGroup;
    }

    get name() {
        return this.data.name;
    }

    get remoteAccess() {
        return this.data.remoteAccess;
    }

    get authentication() {
        return this.data.authentication;
    }

    get sudoAuthentication() {
        return this.data.sudoAuthentication;
    }

    set remoteAccess(remoteAccess) {
        if (!remoteAccess) {
            this.data.remoteAccess = null;
        }
        if (!(remoteAccess instanceof RemoteAccess)) {
            throw new Error("The parameter remoteAccessObj must be of type RemoteAccess");
        }
        this.data.remoteAccess = remoteAccess;
    }

    getConfig(key){
        let obj = this.configs.container[key];
        if(!obj){
            logger.logAndThrow(`No config for ${key} was found.`);
         }
        return obj;
    }

    addConfig(key,config){
        if (!this.data.configs) {
            this.data.configs = new HostComponentContainer("configs");
        }
        this.configs.add(key,config);
    }

    deleteConfig(key){
        let obj = this.configs.container[key];
        if(!obj){
            logger.logAndThrow(`No config for ${key} was found.`);
        }
        //todo call all entity delte methods
        delete this.configs.container[key];
    }
    
    export() {
        let keys = Object.keys(this.data);
        let obj = {};
        keys.forEach((prop)=> {
            if (prop == 'permissions') {
                obj[prop] = parseInt(this.data.permissions.toString(8));
                return;
            }
            if(prop=="deleted" || (prop=="configs" && Object.keys(this.data[prop].container).length==0)){
                return;
            }
            if (Array.isArray(this.data[prop]) && this.data[prop].length > 0 && this.data[prop][0] instanceof HostComponent) {
                obj[prop] = [];
                this.data[prop].forEach((comp)=> {
                    obj[prop].push(comp.export());
                });
            } else if (this.data[prop] instanceof HostComponent) {
                obj[prop] = this.data[prop].export();
            } else if (this.data[prop] instanceof HostComponentContainer) {
                obj[prop] = {};
                let hcKeys = Object.keys(this.data[prop].container);
                hcKeys.forEach((tKey)=> {
                    if (Array.isArray(this.data[prop].container[tKey])) {
                        obj[prop][tKey] = [];
                        this.data[prop].container[tKey].forEach((each)=> {
                            obj[prop][tKey].push(each.export());
                        });
                    } else {
                        obj[prop][tKey] = this.data[prop].container[tKey].export();
                    }
                });
            } else if (this.data[prop] instanceof RemoteAccess) {
                obj[prop] = this.data[prop].export();
            } else {
                obj[prop] = this.data[prop];
            }
        });
        if (!obj.remoteAccess) {
            delete obj["remoteAccess"];
        }
        return obj;
    }

}

export default Host;