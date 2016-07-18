/**
 * Created by mark on 2016/04/16.
 */

import Vincent from '../../../../Vincent';
import UserElement from '../../User';
import UserManager from './UserManager';
import {logger} from '../../../../Logger';
import AppUser from '../../../../ui/AppUser';
import PermissionHelper from '../../../../ui/base/PermissionHelper';


var data = new WeakMap();

class AuthorizedUser extends PermissionHelper {

    /*
     parameter may be username of an object with name,uid keys or a UserElement. USerElemetn is used
     when converting internal data type to UI User type. The data structure is of the following format:
     { name: <username>,uid:<int>, state:<present|absent> }
     */
    constructor(authorizedUser, appUser,host) {
        let obj ={};
        obj.appUser=appUser;
        obj.permObj=host;
        obj.authorizedUser=authorizedUser;
        super(obj.appUser,obj.permObj);
        data.set(this,obj);
    }

    get name() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).authorizedUser.name;
        });
    }

    get state() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).authorizedUser.state;
        });
    }

    set state(state) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).authorizedUser.state = state;
        });
    }

    get keyPath(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).keyPath;
        });
    }
    
    toString() {
        return this._readAttributeWrapper(()=> {
            return `{ name: ${this.name}, state:${this.state} }`;
        });
    }

    inspect() {
        try {
            return this._readAttributeWrapper(()=> {
                return {
                    name: this.name,
                    state: this.state,
                };
            });
        }catch(e) {
            return "Permission denied";
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

export default AuthorizedUser;