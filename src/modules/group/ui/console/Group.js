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

    constructor(group,appUser,manager){
        let obj ={};
        if (group && (typeof group === 'string' || ((group.name!=undefined) && !(group instanceof GroupElement)))) {
            obj.group = new GroupElement(group);
            Vincent.app.provider.managers.groupManager.addValidGroup(obj.group);
        } else if (group instanceof GroupElement) {
            obj.group = group;
        } else {
            throw new Error("The parameter group must be a group name or data object with a name and optional gid, state and member.");
        }
        if (!(appUser instanceof AppUser)) {
            throw new Error("The parameter appUser must be of type AppUser.");
        }
        obj.appUser = appUser;
        if (!(manager instanceof GroupManager)) {
            throw new Error("The parameter manager must be of type GroupManager.");
        }
        obj.permObj = manager;
        super(obj.sesion,obj.permObj);
        data.set(this,obj);
    }

    get gid(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).group.gid;
        });
    }

    get name(){
        return this._readAttributeWrapper(()=> {
            return data.get(this).group.name;
        });
    }

    set gid(value){
        if (typeof value==='number'){
            Vincent.app.provider.managers.groupManager.updateGroupGid(this[_group],value);
        }else{
            console.log("Gid must be a number");
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