/**
 * Created by mark on 2016/04/16.
 */

import Vincent from '../../../../Vincent'
import User from "./User"
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';
import Session from '../../../../ui/Session';
import {logger} from '../../../../Logger';

var data = new WeakMap();

class UserManager extends PermissionsUIManager {

    constructor(session) {
        if(!(session instanceof Session)){
            throw new Error("Parameter session must be an instance of Session");
        }
        super(session, Vincent.app.provider.managers.userManager);
        let obj = {};
        obj.appUser = session.appUser;
        obj.permObj = Vincent.app.provider.managers.userManager;
        obj.session = session;
        data.set(this, obj);
    }

    get list() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return data.get(this).permObj.validUsers.map((user=> {
                    return new User(user, data.get(this).session);
                }));
            });
        } catch (e) {
            return e.message;
            //return [];
        }
    }

    getUser(username) {
        try {
            let user = data.get(this).permObj.findValidUser(username);
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, () => {
                return new User(user, data.get(this).session);
            });
        } catch (e) {
            //console.log(e);
            //return false;
            return e.message;
        }
    }

    addUser(userData) {
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                if (userData && (typeof userData === 'string' || userData.name)) {
                    let user = new User(userData, data.get(this).session);
                    return user;
                } else {
                    data.get(this).session.console.outputError("Parameter must be a username string or a object with a mandatory name and optionally a uid and state property.");
                }
            });
        } catch (e) {
            logger.error(e);
            data.get(this).session.console.outputError(e.message);
        }
    }

    deleteUser(user) {
        let listeners = data.get(this).session.socket.listeners("data");
        let appUser = data.get(this).appUser;
        let session = data.get(this).session;
        let userManager = data.get(this).permObj;
        session.socket.removeAllListeners("data");
        session.socket.write(`Delete user ${user.name ? user.name : user}? (y/n)\r`);
        let func = (data)=> {
            let ans = data.toString();
            if (ans === "yes'" || ans === "y") {
                Vincent.app.provider._writeAttributeCheck(appUser, userManager, ()=> {
                    try {
                        userManager.deleteUser(user);
                        session.socket.write(`User ${user.name? user.name:user} deleted.\r`);
                    } catch (e) {
                        session.socket.write(e.message ? e.message : e);
                    }
                })
            } else {
                session.socket.write(`Deletion of user ${user.name ? user.name : user} cancelled.\r`);
            }
            session.socket.removeAllListeners("data");
            for (var i = 0; i < listeners.length; i++) {
                session.socket.on("data", listeners[i]);
            }
        };
        session.socket.on("data", func);
    };

    changeUserState(user, state) {
        let listeners = data.get(this).session.socket.listeners("data");
        let appUser = data.get(this).appUser;
        let session = data.get(this).session;
        let cli = data.get(this).session.cli;
        let userManager = data.get(this).permObj;
        if (state == "absent") {
            session.socket.removeAllListeners("data");
            session.socket.write(`Mark user ${user.name ? user.name : user} absent? (This will mark user as absent in hosts) (y/n)\n\r`);
            let func = (data)=> {
                let ans = data.toString();
                if (ans === "yes'" || ans === "y") {
                    Vincent.app.provider._writeAttributeCheck(appUser, userManager, ()=> {
                        try {
                            userManager.changeUserState(user, state);
                            cli.outputWarning(`User ${user.name? user.name: user} marked absent.`);
                        } catch (e) {
                            cli.outputError(e.message ? e.message : e);
                        }
                    });
                } else {
                    cli.outputWarning(`Changing of user ${user.name ? user.name : user} state cancelled.\r`);
                }
                session.socket.removeAllListeners("data");
                for (var i = 0; i < listeners.length; i++) {
                    session.socket.on("data", listeners[i]);
                }
            };
            session.socket.on("data", func);
        } else {
            return Vincent.app.provider._writeAttributeCheck(appUser, userManager, ()=> {
                try {
                    userManager.changeUserState(user, state);
                    cli.outputSuccess(`User ${user.name} marked absent.`);
                } catch (e) {
                    cli.outputError(e.message ? e.message : e);
                }
            });
        }
    }

    save() {
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return data.get(this).permObj.save();
            });
        } catch (e) {
            return e.message;
        }
    }

    load() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                if (Vincent.app.provider.managers.userManager.loadFromFile()) {
                    return "Users have been successfully loaded";
                } else {
                    return "Users have been loaded with some errors. Please see log file for details";
                }
            });
        } catch (e) {
            return e.message ? e.message : e;
        }
    }

    clear() {
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                Vincent.app.provider.managers.userManager.clear();
                return ("Users have been cleared and removed from groups and hosts.");
            });
        } catch (e) {
            return e.message;
        }
    }

}

export default UserManager;