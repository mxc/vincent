/**
 * Created by mark on 2016/04/17.
 */
import Vincent from '../../../../Vincent';
import Group from "./Group";
import PermissionsUIManager from '../../../../ui/PermissionsUIManager';

var data = new WeakMap();

class GroupManager extends PermissionsUIManager{
    
    
    constructor(appUser){
        super(appUser, Vincent.app.provider.managers.groupManager);
        let obj = {};
        obj.appUser = appUser;
        obj.permObj = Vincent.app.provider.managers.groupManager;
        data.set(this, obj);
    }

    list() {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return data.get(this).permObj.validGroups.map((group=> {
                    return group.name;
                }));
            });
        } catch (e) {
            return e.message;
        }
    }

    addGroup(group) {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                if (typeof group === 'string' ||( typeof group =="object" && !(group instanceof Group))) {
                    return new Group(group,data.get(this).appUser,data.get(this).permObj);
                } else {
                    return "Parameter must be a group name or group data object";
                }
            });
        } catch (e) {
            return e.message;
        }
    }

    getGroup(groupname) {
        try {
            let group = data.get(this).permObj.findValidGroup(groupname);
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, () => {
                return new Group(group, data.get(this).appUser, data.get(this).permObj);
            });
        } catch (e) {
            //console.log(e);
            //return false;
            return e.message;
        }
    }

    save(){
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, ()=> {
                return data.get(this).permObj.save();
            });
        } catch (e) {
            return e.message;
        }
    }
}

export default GroupManager;