'use strict';

import RemoteAccess from './RemoteAccess';
import Provider from '../../Provider';
import logger from '../../Logger';
import Base from '../../modules/base/Base';
import User from '../user/User';
import AppUser from '../../ui/AppUser';

class Host extends Base {

    constructor(provider, data,owner,group,permissions) {
        super();
        this.errors = [];
        if (!provider || !(provider instanceof Provider)) {
            throw new Error("Parameter provider must be provided for Host.")
        }
        this.provider = provider;

        //check if we were provided with a host name or a data object
        if (typeof data === 'string') {
            var validip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
            var validhostname = /(\w\.)*\w/;
            if (!validip.test(data) && !validhostname.test(data)) {
                logger.logAndThrow(`${data} is an invalid host name`);
            }
            this.data = {
                name: data,
                remoteAccess: new RemoteAccess(),
            };
            this._export = {
                name: data,
                owner:owner,
                group:group,
                permissions: permissions
            };
            this.owner=owner;
            this.group=group;
            this.permissions=permissions;
            this.source = {};
        }else if(typeof data === 'object'){

            if (!data.name) {
                logger.logAndThrow(`The parameter data must be a hostname or an object with a mandatory property \"name\".`);
            }

            this.data = {
                name: data.name,
                remoteAccess: new RemoteAccess(),
                applications: [],
                services: []
            };

            this._export = {
                name: data.name,
                owner:data.owner,
                group:data.group,
                permissions: data.permissions
            };
            this.owner=data.owner;
            this.group=data.group;
            this.permissions=data.permissions;
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
            this._export.owner = owner;
        } else if (owner instanceof User) {
            this.data.owner = owner.name;
            this._export.owner = owner.name;
        } else {
            logger.logAndThrow("Owner must be a username or object of type User.");
        }
    }

    set group(group) {

        if(typeof group ==="string") {
            this.data.group = group;
            this._export.group = group;
        } else {
            logger.logAndThrow("Group must be a string.");
        }
    }

    //perms must be a 9 character string (rwx){3} or a 3 digit octal. Any integer is assumes to be a octal.
    set permissions(perms) {
        if(!perms){
            logger.logAndThrow("Permissions cannot be undefined.");
        }
        let dperms = this.provider._validateAndConvertPermissions(perms);
        if (Number.isInteger(perms)) {
             this._export.permissions = perms;
        }else{
            this._export.permissions = dperms.toString(8);
        }
        this.data.permissions = dperms;
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

    set source(source) {
        this.data.source = source;
    }

    setRemoteAccess(remoteAccess) {
        if (!remoteAccess instanceof RemoteAccess) {
            throw new Error("The parameter remoteAccessObj must be of type RemoteAccess");
        }
        this.data.remoteAccess = remoteAccess;
        this._export.remoteAccess = remoteAccess.export();
    }


    getIncludeName(include) {
        return Object.keys(include)[0];
    }

    checkIncludes() {
        if (!this._export.includes) {
            this._export.includes = {};
        }
    }

    findInclude(include) {
        if (!this._export.includes) {
            this.checkIncludes();
            return;
        } else {
            return this._export.includes[include];
        }

    }

    export() {
        return this._export;
    }

}

export default Host;