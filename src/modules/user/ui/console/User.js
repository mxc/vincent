/**
 * Created by mark on 2016/04/16.
 */

import Vincent from '../../../../Vincent';
import UserElement from '../../User';
import UserManager from './UserManager';
import logger from '../../../../Logger';
import AppUser from '../../../../ui/AppUser';



const _user = Symbol['user'];
const _appUser = Symbol("appUser");
const _manager = Symbol("manager");

class User {

    /*
     parameter may be username of an object with name,uid keys or a UserElement. USerElemetn is used
     when converting internal data type to UI User type. The data structure is of the following format:
     { name: <username>,uid:<int>, state:<present|absent> }
     */
    constructor(user, appUser, manager) {
        if (typeof user === 'string' || (user.name && !user instanceof UserElement)) {
            this[_user] = new UserElement(user);
            Vincent.app.provider.managers.userManager.addValidUser(this[_user]);
        } else if (user instanceof UserElement) {
            this[_user] = user;
        } else {
            throw new Error("The parameter user must be a user name or data object with at least a name key.");
        }
        if (!appUser instanceof AppUser) {
            throw new Error("The parameter appUser must be of type AppUser.");
        }
        this[_appUser] = appUser;
        if (!manager instanceof UserManager) {
            throw new Error("The parameter manager must be of type UserManager.");
        }
        this[_manager] = manager;
    }

    get name() {
        return this._readAttributeWrapper(()=> {
            return this[_user].name;
        });
    }

    set name(name) {
        return this._writeAttributeWrapper(()=> {
            this[_user].name = name;
            return true;
        });
    }

    get uid() {
        return this._readAttributeWrapper(()=> {
            return this[_user].uid;
        });
    }

    set uid(uid) {
        return this._writeAttributeWrapper(()=> {
            Vincent.app.provider.userManager.updateUserUid(this[_user], uid);
            return true;
        });
    }

    get state() {
        return this._readAttributeWrapper(()=> {
            return this[_user].state;
        });
    }

    set state(state) {
        return this._writeAttributeWrapper(()=> {
            this[_user].state = state;
            return true;
        });
    }


    toString() {
        return this._readAttributeWrapper(()=> {
            return `{ name: ${this.name},uid:${this.uid ? this.uid : '-'},state:${this.state} }`;
        });
    }

    inspect() {
        return this._readAttributeWrapper(()=> {
            return {
                name: this.name,
                uid: this.uid ? this.uid : "-",
                state: this.state
            };
        });
    }

    _readAttributeWrapper(func) {
        try {
            return Vincent.app.provider._readAttributeCheck(this[_appUser], this[_manager], func);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    _writeAttributeWrapper(func) {
        try {
            return Vincent.app.provider._writeAttributeCheck(this[_appUser], this[_manager], func);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

}

export default User;