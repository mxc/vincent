/**
 * Created by mark on 2016/04/17.
 */

import Vincent from '../../../../Vincent';
import GroupElement from '../../Group';
import {logger} from '../../../../Logger';
import PermissionHelper from '../../../../ui/base/PermissionHelper';
import AppUser from '../../../../ui/AppUser';
import GroupManager from '../../GroupManager';

var data = new WeakMap();

class Group extends PermissionHelper {

    constructor(group,session){
        let manager = Vincent.app.provider.managers.groupManager;
        let obj ={};
        obj.session = session;
        if (group && (typeof group === 'string' || ((group.name!=undefined) && !(group instanceof GroupElement)))) {
            obj.group = new GroupElement(group);
            Vincent.app.provider.managers.groupManager.addValidGroup(obj.group);
        } else if (group instanceof GroupElement) {
            obj.group = group;
        } else {
            throw new Error("The parameter group must be a group name or data object with a name and optional gid, state and member.");
        }
        if (!(session.appUser instanceof AppUser)) {
            throw new Error("The parameter appUser must be of type AppUser.");
        }
        obj.appUser = session.appUser;
        if (!(manager instanceof GroupManager)) {
            throw new Error("The parameter manager must be of type GroupManager.");
        }
        obj.permObj = manager;
        super(obj.session,obj.permObj);
        data.set(this,obj);
    }

    get gid(){
        return this._readAttributeWrapper(()=> {
            let gid = data.get(this).group.gid;
            return gid? gid: "-";
        });
    }

    get name(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).group.name;
        });
    }

    set gid(value){
        if (typeof value==='number'){
            Vincent.app.provider.managers.groupManager.updateGroupGid(data.get(this).group,value);
        }else{
            logger.error("Group gid must be a number.");
            data.get(this).session.console.outputError("Group gid must be a number.");
        }
    }

    get state() {
        return this._readAttributeWrapper(()=> {
            return data.get(this).group.state;
        });
    }

    set state(state) {
        return this._writeAttributeWrapper(()=> {
            data.get(this).group.state = state;
        });
    }

    inspect(){
        return {
            name: this.name,
            gid: this.gid? this.gid : "-",
            state: this.state
        };
    }

    toString() {
        return `{ group: ${this.group.name},gid:${this.gid ? this.gid : "-"} }`;
    }


}


export default Group;