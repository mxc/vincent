/**
 * Created by mark on 2016/04/16.
 */

import {session} from '../../../../ui/Session'
import User from "./User"

class UserManager {

    list() {
        return session.getProvider().managers.userManager.validUsers.map((user=> {
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
        session.getProvider().textDatastore.saveUsers();
    }
}

export default UserManager;