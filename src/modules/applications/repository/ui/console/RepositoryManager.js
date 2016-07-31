/**
 * Created by mark on 2016/07/31.
 */
import Session from '../../../../../ui/Session';
import HostEntity from '../../../../host/Host';
import AptRepositoryManager from '../../AptRepositoryManager';
import YumRepositoryManager from '../../YumRepositoryManager';
import TaskObject from '../../../../../ui/base/TaskObject';
import base from '../../../../base/Base';
import Package from './Package';

import _ from 'lodash';

var data = new WeakMap();


class RepositoryManager extends TaskObject {

    constructor(repoManager, host, session) {
        if (!(session instanceof Session)) {
            throw new Error("Parameter session must be an instance of Session.");
        }

        if (!(host instanceof HostEntity) && typeof host !== "string") {
            throw new Error("The host parameter must be a host name, or a ui/Host instance.");
        }
        let obj = {};
        obj.permObj = host;
        obj.session = session;
        obj.repositoryManager = repoManager;
        super(session, repoManager, host);
        data.set(this, obj);

        //add properties for the sepcific type of repository
        if (repoManager instanceof AptRepositoryManager) {
        } else if (repoManager instanceof YumRepositoryManager) {
        }
    }

    get updateCache() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).repositoryManager.updateCache;
        });
    }

    set updateCache(cache) {
        this._writeAttributeWrapper(()=> {
            data.updateCache = base.getBooleanValue(cache);
            return this;
        });
    }

    addRepository() {
        throw new Error("Not yet implemented");
    }

    install(repopackage) {
        this._writeAttributeWrapper(()=> {
             data.get(this).repositoryManager.install(repopackage);
            return this;
        });

    }

    remove(repopackage) {
       this._writeAttributeWrapper(()=> {
           data.get(this).repositoryManager.remove(repopackage);
        });
        return this;
    }

    purge(repopackage) {
          this._writeAttributeWrapper(()=> {
            return data.get(this).repositoryManager.purge(repopackage);
        });
        return this;
    }

    doNotUpdate(repopackage) {
        return this._writeAttributeWrapper(()=> {
           return  data.get(this).repositoryManager.doNotUpdate(repopackage);
        });
        return this;
    }

    get packages() {
        return this._readAttributeWrapper(()=> {
            let packs = [];
            data.get(this).repositoryManager.packages.forEach((pack)=>{
                    packs.push(new Package(pack));     
            });
            return packs;
        });
    }

    inspect() {
        let obj = {
            updateCache: data.get(this).repositoryManager.updateCache,
            packageCount: data.get(this).repositoryManager.packages.length
        };
        return obj;
    }
}

export default RepositoryManager;