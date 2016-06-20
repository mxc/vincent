/**
 * Created by mark on 2016/04/16.
 */

import Vincent from '../../../../Vincent';
import UserElement from '../../User';
import UserManager from './UserManager';
import logger from '../../../../Logger';
import AppUser from '../../../../ui/AppUser';
import PermissionHelper from '../../../../ui/base/PermissionHelper';


var data = new WeakMap();

class User extends PermissionHelper {

    /*
     parameter may be username of an object with name,uid keys or a UserElement. USerElemetn is used
     when converting internal data type to UI User type. The data structure is of the following format:
     { name: <username>,uid:<int>, state:<present|absent> }
     */
    constructor(user, appUser, manager) {
        let obj ={};
        if (user && (typeof user === 'string' || ((user.name!=undefined) && !(user instanceof UserElement)))) {
            obj.user = new UserElement(user);
            Vincent.app.provider.managers.userManager.addValidUser(obj.user);
        } else if (user instanceof UserElement) {
            obj.user = user;
        } else {
            throw new Error("The parameter user must be a user name or data object with a name and optional uid, state key.");
        }
        if (!appUser instanceof AppUser) {
            throw new Error("The parameter appUser must be of type AppUser.");
        }
        obj.appUser = appUser;
        if (!manager instanceof UserManager) {
            throw new Error("The parameter manager must be of type UserManager.");
        }
        obj.permObj = manager;
        super(obj.appUser,obj.permObj);
        data.set(this,obj);
    }

    get name() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).user.name;
        });
    }

/*    set name(name) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).user.name = name;
        });
    }
*/
    get uid() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).user.uid;
        });
    }

    set uid(uid) {
        return this._writeAttributeWrapper(()=> {
            Vincent.app.provider.userManager.updateUserUid(data.get(this).user, uid);
            return true;
        });
    }

    get state() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).user.state;
        });
    }

    set state(state) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).user.state = state;
        });
    }

    get publicKey(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).user.key;
        });
    }

    set publicKey(key){
        return this._writeAttributeWrapper(()=> {
            data.get(this).user.setKey(Vincent.app.provider,key);
        });
    }

    toString() {
        return this._readAttributeWrapper(()=> {
            return `{ name: ${this.name},uid:${this.uid ? this.uid : '-'},state:${this.state} }`;
        });
    }

    inspect() {
        try {
            return this._readAttributeWrapper(()=> {
                return {
                    name: this.name,
                    uid: this.uid ? this.uid : "-",
                    state: this.state
                };
            });
        }catch(e) {
            return {
                msg:"Permission denied"
            }
        }
    }

}

export default User;