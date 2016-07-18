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

class Host extends Base {

    constructor(provider, data, owner, group, permissions, configGroup) {
        super();
        this.errors = [];
        this.deleted={};
        if (!provider || !(provider instanceof Provider)) {
            throw new Error("Parameter provider must be provided for Host.")
        }
        this.provider = provider;
        this.data={};
        //check if we were provided with a host name or a data object
        if (typeof data === 'string') {
            this.name = data;
            //if(!owner  || !group){
            //    logger.logAndThrow(`${data} requires a valid owner and group.`);
            //}
            this.owner = owner;
            this.group = group;
            this.permissions = permissions ? permissions : "660";
            //avoid init fields problem for detecting changes in name/configGroup
            this.data.configGroup = configGroup ? configGroup : "default";
        } else if (typeof data === 'object') {
            if (!data.name) {
                logger.logAndThrow(`The parameter data must be a hostname or an object with a mandatory property \"name\".`);
            }
            this.name=data.name;
            // this.data = {
            //     name: data.name
            // };
            //if(!data.owner  || !data.group){
            //    logger.logAndThrow(`${data.name} requires a valid owner and group.`);
            //}
            this.owner = data.owner;
            this.group = data.group;
            this.permissions = data.permissions ? data.permissions : "660";
            //avoid init fields problem for detecting changes in name/configGroup
            this.data.configGroup = data.configGroup ? data.configGroup : "default";
        }

        //configure remoteAccess settings for host.
        if (data.remoteAccess) {
            try {
                let remoteAccessDef = data.remoteAccess;
                let remoteAccess = new RemoteAccess(remoteAccessDef.remoteUser,
                    remoteAccessDef.authentication, remoteAccessDef.becomeUser);
                this.data.remoteAccess = remoteAccess;
            } catch (e) {
                logger.logAndAddToErrors(`Error adding remote access user - ${e.message}`,
                    this.errors);
            }
        }
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

    get configGroup() {
        return this.data.configGroup;
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
        if (!remoteAccess instanceof RemoteAccess) {
            throw new Error("The parameter remoteAccessObj must be of type RemoteAccess");
        }
        this.data.remoteAccess = remoteAccess;
    }

    export() {
        let keys = Object.keys(this.data);
        let obj = {};
        keys.forEach((prop)=> {
            if (prop == 'permissions') {
                obj[prop] = parseInt(this.data.permissions.toString(8));
                return;
            }
            if(prop=="deleted"){
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
                            obj[prop][tKey].push(each.data.export());
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