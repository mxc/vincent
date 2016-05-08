/**
 * Created by mark on 2016/04/17.
 */

import User from './User';
import Vincent from '../../../../Vincent';
import UserAccountElement from '../../../user/UserAccount';
import Host from '../../../host/ui/console/Host';
import AppUser from '../../../../ui/AppUser';

const _userAccount = Symbol("userAccount");
const _appUser = Symbol("appUser");
const _host = Symbol("host");
const _manager = Symbol("manager");

class UserAccount {
    constructor(data, host, appUser) {
        if (!appUser instanceof AppUser) {
            console.log("The appUser parameter must be of type AppUser.");
            return {msg: "UserAccount creation failed"};
        }
        this[_appUser] = appUser;

        if (!host instanceof Host) {
            console.log("The appUser parameter must be of type AppUser.");
            return {msg: "UserAccount creation failed"};
        }
        this[_host] = host;

        // if (!manager instanceof UserManager) {
        //     console.log("The manager parameter must be of type UserManager.");
        //     return { msg:"UserAccount creation failed"};
        // }
        //
        // this[_host] = host;

        if (typeof data === "string" || typeof data.user === "string" || data.user instanceof User) {
            let username = '';
            if (typeof data === "string") {
                username = data;
            } else if (typeof data.user === 'string') {
                username = data.user;
            } else {
                username = data.user.name;
            }
            let user = app.provider.userManager.findValidUserByName(username);
            if (user && data.authorized_keys) {
                this[_userAccount] = new UserAccountElement({
                    user: user,
                    authorized_keys: data.authorized_keys
                });
            } else if (user) {
                this[_userAccount] = new UserAccountElement({user: user});
            } else {
                console.log(`The user ${data} is not a valid user.`);
                throw new Error(`The user ${data} is not a valid user.`)
            }
        } else if (data instanceof UserAccountElement) {
            this[_userAccount] = data;
        }
    }

    get user() {
        return this._readAttributeWrapper(()=> {
            return Object.freeze(User(this[_userAccount].user));
        });
    }

    get authorized_keys() {
        return this._readAttributeWrapper(()=> {
            if (Vincent.app.provider.checkPermissions(this[_appUser], this[_host], "w")) {
                return this[_userAccount].authorized_keys;
            } else {
                return Object.freeze(this[_userAccount].authorized_keys);
            }
        });
    }

    set authorized_keys(array) {
        return this._writeAttributeWrapper(()=> {
            if (Array.isArray(array)) {
                if (array.length > 0 && typeof array[0] === 'string') {
                    this[_userAccount].authorized_keys = array;
                    return this[_userAccount].authorized_keys;
                } else {
                    console.log("Invalid array format for authorized_keys");
                    return false;
                }
            }
        });
    }

    addAuthorizedUser(user) {
        return this._writeAttributeWrapper(()=> {
            if (typeof user === "string") {
                var _user = Vincent.app.provider.userManager.findValidUserByName(user);
            } else if (user instanceof User) {
                var _user = Vincent.app.provider.userManager.findValidGroupByName(user.name);
            }
            if (_user) {
                this[_userAccount].addAuthorizedUser(_user);
                return this[_userAccount].authorized_keys;
            } else {
                console.log("User was not found in valid users list.");
                return false;
            }
        });
    }

    toString() {
        return `{ user: ${this.user.name},authorized_keys:${this.authorized_keys} }`;
    }

    inspect() {
        return {
            user: this.user.name,
            authorized_keys: this.authorized_keys
        }
    }

    _readAttributeWrapper(func) {
        try {
            return Vincent.app.provider._readAttributeCheck(this[_appUser], this[_host], func);
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    _writeAttributeWrapper(func) {
        try {
            return Vincent.app.provider._writeAttributeCheck(this[_appUser], this[_host], func);
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

export default UserAccount;