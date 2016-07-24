/**
 * Created by mark on 2016/04/17.
 */

import User from './User';
import Vincent from '../../../../Vincent';
import UserAccountElement from '../../../user/UserAccount';
import HostElement from '../../../host/Host';
import Host from '../../../host/ui/console/Host';
import Session from '../../../../ui/Session';
import TaskObject from '../../../../ui/base/TaskObject';
import AuthorizedUser from './AuthorizedUser';
import {logger} from '../../../../Logger';

var data = new WeakMap();

class UserAccount extends TaskObject {
    
    constructor(userData, host, session) {
        let obj={};
        if (!(session instanceof Session)) {
            throw new Error("Parameter appUser must be of type AppUser.");
        }

        obj.session = session;
        obj.appUser = session.appUser;

        if (!(host instanceof Host)  && !(host instanceof HostElement)) {
            throw new Error("UserAccount creation failed - parameter host not of type Host.");
        }
        let rHost = Vincent.app.provider.managers.hostManager.findValidHost(host.name,host.configGroup);
        obj.permObj  = rHost;

        if (typeof userData === "string" || typeof userData.user === "string" || userData instanceof User) {
            let username = '';
            if (typeof userData === "string") {
                username = userData;
            } else if (typeof userData.user === 'string') {
                username = userData.user;
            } else {
                username = userData.name;
            }
            let user = Vincent.app.provider.managers.userManager.findValidUserByName(username);
            if (user && userData.authorized_keys) {
                obj.userAccount = new UserAccountElement(Vincent.app.provider,{
                    user: user,
                    authorized_keys: userData.authorized_keys
                });
            } else if (user) {
                obj.userAccount = new UserAccountElement(Vincent.app.provider,{user: user});
            } else {
                throw new Error(`The user ${userData} is not a valid user.`);
            }
            Vincent.app.provider.managers.userManager.addUserAccountToHost(obj.permObj, obj.userAccount);
        } else if (userData instanceof UserAccountElement) {
            obj.userAccount = userData;
        } else{
            throw new Error(`User account creation failed.`);
        }
        super(session,obj.userAccount,obj.permObj);
        data.set(this,obj);
    }

    get user() {
        return this._readAttributeWrapper(()=> {
            return Object.freeze(new User(data.get(this).userAccount.user,data.get(this).session));
        });
    }

    get state(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).userAccount.state;
        });
    }

    set state(state) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).userAccount.state = state;
        });
    }

    get authorized_keys() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).userAccount.authorized_keys.map((au)=> {
                try {
                    let tuser = new AuthorizedUser(au, data.get(this).session, data.get(this).permObj);
                    return tuser;
                }catch(e){
                    logger.error(e);
                    data.get(this).session.console.outputError(e.message? e.message: e);
                }
             });
        });
    }

    addAuthorizedUser(user) {
        return this._writeAttributeWrapper(()=> {
            try {
                if (typeof user === "string") {
                    var _user = Vincent.app.provider.managers.userManager.findValidUserByName(user);
                } else if (user instanceof User) {
                    _user = Vincent.app.provider.managers.userManager.findValidUserByName(user.name);
                }
                if (_user) {
                    data.get(this).userAccount.addAuthorizedUser(_user);
                    return this.authorized_keys;
                } else {
                    data.get(this).session.console.outputWarning("User was not found in valid users list.");
                }
            }catch(e){
                data.get(this).session.console.outputError(e.message? e.message:e);
            }
        });
    }
    
    getAuthorizedUser(user){
        if(!(user instanceof User)){
            user = user.name;
        } 
        if(typeof user !=="string" ){
            data.get(this).session.console.outputError( "User must be an instance of User or a username string.");
            return;
        }
        aus = this.authorized_keys;
        let found =aus.find((au)=>{
            if(au.name==user){
                return au;
            }
        });
        if(found){
            return found;
        }else{
            data.get(this).session.console.outputWarning(`${user} not found in authorized keys.`);
            return;
        }
    }
    
    changeAuthorizedUserState(user,state){
        return this._writeAttributeWrapper(()=> {
            try {
                if (typeof user === "string") {
                    var _user = Vincent.app.provider.managers.userManager.findValidUserByName(user);
                } else if (user instanceof User) {
                    _user = Vincent.app.provider.managers.userManager.findValidUserByName(user.name);
                }
                if (_user) {
                    data.get(this).userAccount,changeAuthorizedUserState(_user,state);
                    return this.getAuthorizedUser(user.name);
                } else {
                    data.get(this).session.console.outputWarning("User was not found in valid users list.");
                    return;
                }
            }catch(e){
                data.get(this).session.console.outputError( e.message? e.message:e);
            }
        });
    }

    toString() {
        return `{ user: ${ data.get(this).userAccount.user.name},authorized_keys:${ data.get(this).userAccount.authorized_keys} }`;
    }

    inspect() {
        return {
            user:  data.get(this).userAccount.user.name,
            state: data.get(this).userAccount.state,
            authorized_keys:  JSON.stringify(data.get(this).userAccount.authorized_keys)
        }
    }

    // _readAttributeWrapper(func) {
    //     try {
    //         return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
    //     } catch (e) {
    //         return false;
    //     }
    // }
    //
    // _writeAttributeWrapper(func) {
    //     try {
    //         return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser,data.get(this).permObj, func);
    //     } catch (e) {
    //         return false;
    //     }
    // }
    
}

export default UserAccount;