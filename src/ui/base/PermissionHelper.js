/**
 * Created by mark on 2016/05/10.
 */

import Vincent from '../../Vincent';
import {logger} from '../../Logger';
import Session from '../Session';

var data = new WeakMap();

class PermissionHelper {

    constructor(session,permObj){
            if(!(session instanceof Session)){
                throw new Error(`Parameter session must be an instance of Session for ${permObj.constructor.name}`);
            }
            data.set(this,{appUser: session.appUser,session:session, permObj:permObj});
    }
    
    logAndDisplayError(e){
        let msg = e.message? e.message : e;
        logger.error(msg);
        data.get(this).session.cli.outputError(msg);        
    }

    logAndDisplayWarning(e){
        let msg = e.message? e.message : e;
        logger.error(msg);
        data.get(this).session.cli.outputWarning(msg);
    }

    
    _readAttributeWrapper(func) {
        try {
            let func1 = ()=>{ return func(data.get(this).appUser, data.get(this).permObj)};
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, func1);
        } catch (e) {
            logger.info(e);
            throw e;
        }
    }

    _writeAttributeWrapper(func) {
        try {
            let func1 = ()=>{ return func(data.get(this).appUser, data.get(this).permObj)};
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, func1);
        } catch (e) {
            logger.info(e);
            throw e;
        }
    }

}

export default PermissionHelper;