/**
 * Created by mark on 2016/05/08.
 */


import Vincent from '../Vincent';
import PermissionHelper from './base/PermissionHelper';

var data = new WeakMap();


class PermissionsUIManager extends PermissionHelper {

    constructor(appUser,manager){
        super(appUser,manager);
        data.set(this,{appUser:appUser,permObj:manager})
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
        return genfunc(objdata,data.get(this).appUser,data.get(this).permObj);
    }

}

export default PermissionsUIManager;