/**
 * Created by mark on 2016/04/16.
 */

import {app} from '../../../../Vincent'
import User from "./User"

const _appUser = Symbol("appUser");


class UserManager {
    
    constructor(appUser){
        this[_appUser] = appUser;
    }

    list() {
        
        return app.provider.managers.userManager.validUsers.map((user=> {
            return user.name;
        }));
    }

    addUser(data) {
        if (typeof data === 'string' || (typeof data ==="object" && !data instanceof User)) {
            new User(data);
            console.log(`created user ${data}`);
        } else {
            console.log("Parameter must be a username string");
        }
    }

    save(){
        app.provider.textDatastore.saveUsers();
    }
}

export default UserManager;