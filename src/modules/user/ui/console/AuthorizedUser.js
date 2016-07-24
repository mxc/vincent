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
    constructor(authorizedUser, session,host) {
        let obj ={};
        obj.appUser=session.appUser;
        obj.permObj=host;
        obj.session = session;
        obj.authorizedUser=authorizedUser;
        super(obj.session,obj.permObj);
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
            data.get(this).session.console.outputError(`Permission denied - ${e.message ? e.message : e}`);
        }
    }

}

export default AuthorizedUser;