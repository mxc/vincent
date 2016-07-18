/**
 * Created by mark on 2016/07/18.
 */

import User from './User';
import {logger} from "../../Logger";
    
class AuthorizedUser  {

    constructor(user) {
        if(user instanceof User) {
            this.data={};
            this.data.name = user.name;
            this.data.keyPath = user.keyPath;
            this.data.state = user.state;
        }else{
            logger.logAndThrow("Parameter user must be an instance of User.");
        }
    }

  
    get name (){
        return this.data.name;
    }
    
    get state(){
        return this.data.state;
    }
    
    set state(state){
        return this.data.state=state;
    }
    
    get keyPath(){
        return this.data.keyPath;
    }
    
    inspect(){
        return {
            name: this.name,
            state: this.state,
            key: this.keyPath
        }
    }
    
}

export default AuthorizedUser;