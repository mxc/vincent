/**
 * Created by mark on 2016/04/27.
 */

import AuthenticationProvider from './AuthenticationProvider';


class DBAuthProvider extends AuthenticationProvider{

    constructor(provider){
        super();
        this.provider = provider;
    }

    authenticate(username,password){
        throw new Error ("not yet implemented");
    }
    
    getGroups(){

    }

}

export default DBAuthProvider;
