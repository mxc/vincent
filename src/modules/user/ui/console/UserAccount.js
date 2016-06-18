/**
 * Created by mark on 2016/04/17.
 */

import User from './User';
import Vincent from '../../../../Vincent';
import UserAccountElement from '../../../user/UserAccount';
import HostElement from '../../../host/Host';
import Host from '../../../host/ui/console/Host';
import AppUser from '../../../../ui/AppUser';


var data = new WeakMap();

class UserAccount {
    constructor(userData, host, appUser) {

        let obj={};
        if (!appUser instanceof AppUser) {
            throw new Error("Parameter appUser must be of type AppUser.");
        }
        obj.appUser = appUser;

        if (!(host instanceof Host)  && !(host instanceof HostElement)) {
            //console.log("The host parameter must be of type Host.");
            throw new Error("UserAccount creation failed - parameter host not of type Host.");
        }
        let rHost = Vincent.app.provider.managers.hostManager.findValidHost(host.name);
        obj.permObj  = rHost;

        if (typeof userData === "string" || typeof userData.user === "string" || userData instanceof User) {
            let username = '';
            if (typeof userData === "string") {
                username = userData;
            } else if (typeof userData.user === 'string') {
                username = userData.user;
            } else {
                username = userData.name;
            }
            let user = Vincent.app.provider.managers.userManager.findValidUserByName(username);
            if (user && userData.authorized_keys) {
                obj.userAccount = new UserAccountElement(Vincent.app.provider,{
                    user: user,
                    authorized_keys: userData.authorized_keys
                });
            } else if (user) {
                obj.userAccount = new UserAccountElement(Vincent.app.provider,{user: user});
            } else {
                console.log(`The user ${userData} is not a valid user.`);
                throw new Error(`The user ${userData} is not a valid user.`)
            }
        } else if (userData instanceof UserAccountElement) {
            obj.userAccount = userData;
        } else{
            console.log("The data parameter must be a username string or a object with a user property of type string or User.");
            return  "UserAccount creation failed";
        }
        Vincent.app.provider.managers.userManager.addUserAccountToHost(obj.permObj,obj.userAccount);
        data.set(this,obj);
    }

    get user() {
        return this._readAttributeWrapper(()=> {
            return Object.freeze(new User(data.get(this).userAccount.user,data.get(this).appUser,data.get(this).permObj));
        });
    }

    get authorized_keys() {
        return this._readAttributeWrapper(()=> {
            if (Vincent.app.provider.checkPermissions(data.get(this).appUser, data.get(this).permObj, "w")) {
                return data.get(this).userAccount.user.authorized_keys;
            } else {
                return Object.freeze(data.get(this).userAccount.user.authorized_keys);
            }
        });
    }

    set authorized_keys(array) {
        return this._writeAttributeWrapper(()=> {
            if (Array.isArray(array)) {
                if (array.length > 0 && typeof array[0] === 'string') {
                    data.get(this).userAccount.user.authorized_keys = array;
                    return data.get(this).userAccount.user.authorized_keys;
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
                data.get(this).userAccount.user.addAuthorizedUser(_user);
                return data.get(this).userAccount.user.authorized_keys;
            } else {
                console.log("User was not found in valid users list.");
                return false;
            }
        });
    }

    toString() {
        return `{ user: ${ data.get(this).userAccount.user.name},authorized_keys:${ data.get(this).userAccount.user.authorized_keys} }`;
    }

    inspect() {
        return {
            user:  data.get(this).userAccount.user.name,
            authorized_keys:  data.get(this).userAccount.user.authorized_keys
        }
    }

    _readAttributeWrapper(func) {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
        } catch (e) {
            //console.log(e);
            return false;
        }
    }

    _writeAttributeWrapper(func) {
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser,data.get(this).permObj, func);
        } catch (e) {
            //console.log(e);
            return false;
        }
    }
}

export default UserAccount;