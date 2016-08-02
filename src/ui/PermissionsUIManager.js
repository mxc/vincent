/**
 * Created by mark on 2016/05/08.
 */


import Vincent from '../Vincent';
import PermissionHelper from './base/PermissionHelper';
import Session from './Session';
import {logger} from '../Logger';

var data = new WeakMap();


class PermissionsUIManager extends PermissionHelper {

    constructor(session,manager){
        if(!(session instanceof Session)){
            let error = new Error(`The session parameter must be a Session instance for ${manager.constructor.name}.`);
            logger.error(error.stack);
            logger.logAndThrow(e.message);

        }
        super(session,manager);
        data.set(this,{appUser:session.appUser,session: session,permObj:manager})
    }

    get owner(){
        return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            return data.get(this).permObj.owner;
        });
    }

    get group(){
        return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            return data.get(this).permObj.group;
        });
    }

    get permissions(){
        return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            return data.get(this).permObj.permissions;
        });
    }

    set owner(owner) {
        Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            data.get(this).permObj.owner = owner;
        });
    }

    set group(group) {
        Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            data.get(this).permObj.group = group;
        });
    }

    set permissions(permissions) {
        Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
            data.get(this).permObj.permissions = permissions;
        });
    }
    
    genFuncHelper(genfunc,objdata){
        return genfunc(objdata,data.get(this).session,data.get(this).permObj);
    }

}

export default PermissionsUIManager;