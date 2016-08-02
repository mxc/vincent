/**
 * Created by mark on 2016/04/17.
 */
import Vincent from '../../../../Vincent';
import Group from "./Group";
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';
import {logger} from '../../../../Logger';

var data = new WeakMap();

class GroupManager extends PermissionsUIManager{
    
    
    constructor(session){
        super(session, Vincent.app.provider.managers.groupManager);
        let obj = {};
        obj.appUser = session.appUser;
        obj.session = session;
        obj.permObj = Vincent.app.provider.managers.groupManager;
        data.set(this, obj);
    }

    get list() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return data.get(this).permObj.validGroups.map((group=> {
                    return group.name;
                }));
            });
        } catch (e) {
            logger.error(e);
            data.get(this).session.console.outputError(e.message);
        }
    }

    addGroup(group) {
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                if (typeof group === 'string' ||( typeof group =="object" && !(group instanceof Group))) {
                    return new Group(group,data.get(this).session);
                } else {
                    data.get(this).session.console.outputError("Parameter must be a group name or group data object.");
                }
            });
        } catch (e) {
            logger.error(e);
            data.get(this).session.console.outputError(e.message);
        }
    }

    getGroup(groupname) {
        try {
            let group = data.get(this).permObj.findValidGroup(groupname);
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, () => {
                return new Group(group, data.get(this).session);
            });
        } catch (e) {
            logger.error(e);
            data.get(this).session.console.outputError(e.message);
        }
    }

    save(){
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return data.get(this).permObj.save();
            });
        } catch (e) {
            logger.error(e);
            data.get(this).session.console.outputError(e.message);
        }
    }

    load(){
        try{
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser,data.get(this).permObj,()=>{
                if(Vincent.app.provider.managers.groupManager.loadFromFile()){
                    return "Groups have been successfully loaded";
                }else{
                    return "Groups have been loaded with some errors. Please see log file for details";
                }
            });
        }catch(e){
            logger.error(e);
            data.get(this).session.console.outputError(e.message);
        }
    }
}

export default GroupManager;