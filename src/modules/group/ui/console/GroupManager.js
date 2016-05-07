/**
 * Created by mark on 2016/04/17.
 */
import Vincent from '../../../../Vincent';
import Group from "./Group";

const _appUser = Symbol["appUser"];

class GroupManager{
    
    
    constructor(appUser){
        this[_appUser] = appUser;
    }

    list() {
        return Vincent.app.provider.managers.groupManager.validGroups.map((group=> {
            return group.name;
        }));
    }

    addGroup(data) {
        if (typeof data === 'string' ||( typeof data =="object" && !data instanceof Group)) {
            new Group(data);
            console.log(`created group ${data.name? data.name :data}`);
        } else {
            console.log("Parameter must be a group name or group data object");
        }
    }

    save(){
        Vincent.app.provider.textDatastore.saveGroups();
    }
}

export default GroupManager;