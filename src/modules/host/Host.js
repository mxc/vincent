'use strict';

import HostGroup from '../group/HostGroup';
import RemoteAccess from '../../coremodel/hostcomponents/RemoteAccess';
import HostSsh from '../../coremodel/hostcomponents/HostSsh';
import HostSudoEntry from '../../coremodel/hostcomponents/HostSudoEntry';
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
            var validhostname = /\w\.{2}\w/;
            if (!validip.test(data) && !validhostname.test(data)) {
                logger.logAndThrow(`${data} is an invalid host name`);
            }
            this.data = {
                name: data,
                remoteAccess: new RemoteAccess(),
                //users: [],
                //groups: []
            };
            this._export = {
                name: data.name,
                //users: [],
                //groups: []
            };
            this.source = {};
            //give modules opportunity to addValidGroup their data structures to host data and _export objects
            for (var manager in this.provider.managers) {
                if (this.provider.managers[manager].initialiseHost) {
                    this.provider.managers[manager].initialiseHost(this);
                }
            }
            return;
        }
        if (!data.name) {
            logger.logAndThrow(`The parameter data must be a hostname or an object with a mandatory property \"name\".`);
        }
        this.data = {
            name: data.name,
            remoteAccess: new RemoteAccess(),
            //users: [],
            //groups: [],
            applications: [],
            services: []
        };
        this._export = {
            name: data.name,
            //users: [],
            //groups: []
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

    get ssh() {
        if (this.data.hostSsh) {
            return this.data.hostSsh.ssh;
        }
    }

    get sudoerEntries() {
        return this.data.sudoerEntries;
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

    addSsh(config) {
        if (typeof config === 'object') {
            this.data.hostSsh = new HostSsh(this.provider, config);
            this.data.hostSsh.host = this;
            this._export.ssh = this.data.hostSsh.data.export();
        } else {
            let configDef = this.provider.sshConfigs.find(config);
            if (!configDef) {
                throw new Error(`Ssh config '${config}' not found.`);
            }
            this.data.hostSsh = new HostSsh(this.provider,
                configDef);
            this.data.hostSsh.host = this;
            this.checkIncludes();
            this._export.includes["ssh"] = config;
        }
        Array.prototype.push.apply(this.errors, this.data.hostSsh.errors);

    }

    addSudoEntry(sudoData) {
        if (!this.data.sudoerEntries) {
            this.data.sudoerEntries = [];
        }
        try {
            if (typeof sudoData == "string") {
                if (!this._export.includes) {
                    this._export.includes = {};
                    this._export.includes.sudoerEntries = [];
                } else if (!this._export.includes.sudoerEntries) {
                    this._export.includes.sudoerEntries = [];
                }
                let sudoDataLookup = this.provider.sudoerEntries.find(sudoData);
                let hostSudoEntry = new HostSudoEntry(this.provider, this, sudoDataLookup);
                this.data.sudoerEntries.push(hostSudoEntry);
                this._export.includes.sudoerEntries.push(sudoData);
            } else {
                let hostSudoEntry = new HostSudoEntry(this.provider, this, sudoData);
                this.data.sudoerEntries.push(hostSudoEntry);
                if (!this._export.sudoerEntries) {
                    this._export.sudoerEntries = [];
                }
                this._export.sudoerEntries.push(hostSudoEntry.sudoEntry.export());
            }
        }
        catch (e) {
            logger.logAndThrow(`Error adding SudoerEntry - ${e.message}`);
        }
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