/**
 * Created by mark on 2016/04/17.
 */

import User from './User';
import {session} from '../../../../ui/Console/Console';
import UserAccountElement from '../../../user/UserAccount';

const _userAccount = Symbol("userAccount");

class UserAccount {
    constructor(data) {
        if (typeof data === "string" || typeof data.user === "string" || data.user instanceof User) {
            let username='';
            if (typeof data === "string") {
                username = data;
            }else if(typeof data.user==='string'){
                username = data.user;
            }else{
                username = data.user.name;
            }
            let user = session.getProvider().userManager.findValidUserByName(username);
            if (user && data.authorized_keys) {
                this[_userAccount] = new UserAccountElement({
                    user: user,
                    authorized_keys: data.authorized_keys
                });
            } else if (user) {
                this[_userAccount] = new UserAccountElement({user: user});
            } else {
                console.log(`The user ${data} is not a valid user`);
                throw new Error(`The user ${data} is not a valid user`)
            }
        } else if (data instanceof UserAccountElement) {
            this[_userAccount] = data;
        }
    }

    get user() {
        return new User(this[_userAccount].user);
    }

    get authorized_keys() {
        return this[_userAccount].authorized_keys;
    }

    set authorized_keys(array) {
        if(Array.isArray(array)){
            if (array.length>0 && typeof array[0]==='string'){
                this[_userAccount].authorized_keys = array;
            }else{
                this[_userAccount].authorized_keys.empty();
            }
        }
    }

    addAuthorizedUser(user) {
        if (typeof user === "string") {
            var _user = session.getProvider().userManager.findValidUserByName(user);
        } else if (user instanceof User) {
            var _user = session.getProvider().userManager.findValidGroupByName(user.name);
        }
        if (_user) {
            this[_userAccount].addAuthorizedUser(_user);
        } else {
            console.log("User was not found in valid users list.");
        }
    }

    toString() {
        return `{ user: ${this.user.name},authorized_keys:${this.authorized_keys} }`;
    }

    inspect(){
        return {
            user: this.user.name,
            authorized_keys: this.authorized_keys
        }
    }
}

export default UserAccount;