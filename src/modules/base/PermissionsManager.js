/**
 * Created by mark on 2016/05/08.
 */

import Manager from './Manager';
import {logger} from '../../Logger';
import User from '../user/User';


class PermissionsManager extends Manager {
    
    constructor(provider){
        super();
        this._owner = provider.config.get("owner") ? provider.config.get("owner") : "root"; //default owner
        this._group = provider.config.get("group") ? provider.config.get("group") : "vincent"; //default group
        this._permissions = provider.config.get("permissions")? provider.config.get("permissions"): "774"; //default permissions
    }

    get owner() {
        return this._owner;
    }

    get group() {
        return this._group;
    }

    get permissions() {
        return this._permissions;
    }

    //todo check if this is a valid user?
    set owner(owner) {
        if (typeof owner === 'string') {
            this._owner = owner;
        } else if (owner instanceof User) {
            this._owner = owner.name;
        } else {
            logger.logAndThrow("Owner must be a username or object of type User and cannot be null or undefined.");
        }
    }

    set group(group) {

        if (typeof group === "string") {
            this._group = group;
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
        this._permissions = dperms;
    }


}

export default PermissionsManager;