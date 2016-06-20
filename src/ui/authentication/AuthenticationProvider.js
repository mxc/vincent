/**
 * Created by mark on 2016/04/27.
 */


class AuthenticationProvider {

    authenticate(username,password){
        throw new Error ("not yet implemented");
    }

    getGroups(username){
        throw new Error ("not yet implemented");
    }


    changePassword(username,password){
        throw new Error ("not yet implemented");
    }
    
}

export default AuthenticationProvider;