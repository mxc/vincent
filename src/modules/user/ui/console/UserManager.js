/**
 * Created by mark on 2016/04/16.
 */

import Vincent from '../../../../Vincent'
import User from "./User"
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';

const _appUser = Symbol("appUser");
const _manager = Symbol("manager");
const _provider = Symbol("provider");

class UserManager extends PermissionsUIManager {

    constructor(appUser) {
        super(appUser,Vincent.app.provider.managers.userManager);
        this[_appUser] = appUser;
        this[_manager] = Vincent.app.provider.managers.userManager;
        this[_provider] = Vincent.app.provider;
    }

    list() {
        try {
           return this[_provider]._readAttributeCheck(this[_appUser], this[_manager],()=> {
              return this[_manager].validUsers.map((user=> {
                  return user.name;
              }));
          });
        }catch(e){
            console.log(e);
            return [];
        }
    }

    getUser(username) {
        try {
            let user = this[_manager].findValidUser(username);
            return this[_provider]._readAttributeCheck(this[_appUser], this[_manager], () => {
                return new User(user, this[_appUser]);
            });
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    addUser(data) {
        try {
            return this[_provider]._writeAttributeCheck(this[_appUser], this[_manager], ()=> {
                if (typeof data === 'string' || (typeof data === "object" && !data instanceof User)) {
                    console.log(`created user ${data}`);
                    return new User(data,this[_appUser],this);
                } else {
                    console.log("Parameter must be a username string");
                    return false;
                }
            });
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    save() {
        try {
            return this[_provider]._writeAttributeCheck(this[_appUser], this[_manager], ()=> {
                this[_manager].userManager.save();
            });
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

export default UserManager;