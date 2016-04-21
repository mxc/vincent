'use strict';

import RemoteAccess from './RemoteAccess';
import Provider from '../../Provider';
import logger from '../../Logger';
import Base from '../../modules/base/Base';

class Host extends Base {

    constructor(provider, data) {
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
                name: data.name,
            };
            this.source = {};
            return;
        }
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
        };
        //give modules opportunity to addValidGroup their data structures to host data and _export objects
        for (var manager in this.provider.managers) {
            if (this.provider.managers[manager].initialiseHost) {
                this.provider.managers[manager].initialiseHost(this);
            }
        }
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