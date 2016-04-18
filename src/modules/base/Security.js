/**
 * Created by mark on 2016/04/15.
 */
import logger from '../../Logger';

class Security {

    static CheckAccess(target, name, descriptor,role) {
        let func = descriptor.value;
        if (typeof func == 'function'){
            descriptor.value=function(...args){
                logger.info(`Role=${role}`);
                logger.info("performing security check");
                if (!session || !session.isAuthenticated()){
                    logger.logAndThrow("User session not found. Please login.")
                }else{
                    logger.info("user is authenticated. checking roles");
                    //user.roles

                }
                func.call(this,...args);
            }
        }
        return descriptor;
    }

}

export default Security.CheckAccess;