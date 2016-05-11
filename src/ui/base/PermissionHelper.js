/**
 * Created by mark on 2016/05/10.
 */

import Vincent from '../../Vincent';

var data = new WeakMap();

class PermissionHelper {

    constructor(appUser,permObj){
            data.set(this,{appUser: appUser, permObj:permObj});
    }

    _readAttributeWrapper(func) {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    _writeAttributeWrapper(func) {
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

}

export default PermissionHelper;