/**
 * Created by mark on 2016/04/16.
 */

import {app} from '../../../../Vincent';
import UserElement from '../../User';
import logger from '../../../../Logger';

const _user = Symbol['user'];
const _appUser = Symbol("appUser");

class User {

    /*
     parameter may be username of an object with name,uid keys or a UserElement. USerElemetn is used
     when converting internal data type to UI User type. The data structure is of the following format:
     { name: <username>,uid:<int>, state:<present|absent> }
     */
    constructor(user,appUser) {
        if (typeof user === 'string' || (user.name && !user instanceof UserElement)) {
            this[_user] = new UserElement(user);
            app.provider.managers.userManager.addValidUser(this[_user]);
        } else if (user instanceof UserElement) {
            this[_user] = user;
        } else {
            throw new Error("The parameter must be a user name or data object with at least a name key");
        }
        this[_appUser] = appUser;
    }

    get name() {
        return this[_user].name;
    }

    set name(name) {
        this[_user].name = name;
    }

    get uid() {
        return this[_user].uid;
    }

    set uid(uid) {
        app.provider.userManager.updateUserUid(this[_user],uid);
    }

    get state() {
        return this[_user].state;
    }

    set state(state) {
        this[_user].state = state;
    }

    toString() {
        return `{ name: ${this.name},uid:${this.uid ? this.uid : '-'},state:${this.state} }`;
    }

    inspect(){
        return {
            name: this.name,
            uid: this.uid? this.uid : "-",
            state: this.state
        };
    }

}

export default User;