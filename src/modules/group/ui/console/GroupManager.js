/**
 * Created by mark on 2016/04/17.
 */
import {app} from '../../../../Vincent';
import Group from "./Group";

class GroupManager{

    list() {
        return app.provider.managers.groupManager.validGroups.map((group=> {
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
        app.provider.textDatastore.saveGroups();
    }
}

export default GroupManager;