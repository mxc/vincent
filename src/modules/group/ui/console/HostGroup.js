/**
 * Created by mark on 2016/04/17.
 */

import Vincent from '../../../../Vincent';
import HostGroupElement from '../../HostGroup';
import HostElement from '../../../host/Host';
import Host from '../../../host/ui/console/Host';
import Group from  './Group';
import User from '../../../user/ui/console/User';
import AppUser from '../../../../ui/AppUser';
import TaskObject from '../../../../ui/base/TaskObject';

var data = new WeakMap();


class HostGroup extends TaskObject {

    constructor(hostGroupData, host, appUser) {
        let obj = {};
        if (!appUser instanceof AppUser) {
            throw new Error("Parameter appUser must be of type AppUser.");
        }
        obj.appUser = appUser;
        if (!(host instanceof Host) && !(host instanceof HostElement)) {
            //console.log("The host parameter must be of type Host.");
            throw new Error("HostGroup creation failed - parameter host not of type console Host or Host.");
        }

        let rHost = Vincent.app.provider.managers.hostManager.findValidHost(host.name,host.configGroup);
        obj.permObj = rHost;
        if (typeof hostGroupData === "string" || typeof hostGroupData.group === "string" || hostGroupData instanceof Group) {
            let groupname = '';
            if (typeof hostGroupData === "string") {
                groupname = hostGroupData;
            } else if (typeof hostGroupData.group === 'string') {
                groupname = hostGroupData.group;
            } else {
                groupname = hostGroupData.name;
            }
            let group = Vincent.app.provider.managers.groupManager.findValidGroupByName(groupname);
            if (group && hostGroupData.members) {
                obj.hostGroup = new HostGroupElement(Vincent.app.provider, {
                    group: group,
                    members: hostGroupData.members
                });
            } else if (group) {
                obj.hostGroup = new HostGroupElement(Vincent.app.provider, {group: group});
            } else {
                //console.log(`The group ${group} is not a valid group`);
                throw new Error(`The group ${hostGroupData} is not a valid group`)
            }
        } else if (hostGroupData instanceof HostGroupElement) {
            obj.hostGroup = hostGroupData;
        }
        try {
            Vincent.app.provider.managers.groupManager.addHostGroupToHost(obj.permObj, obj.hostGroup);
        }catch(e){
            //swallow error - hostgroup already part of host.
        }
        super(obj.hostGroup);
        data.set(this, obj);
    }

    get group() {
        return this._readAttributeWrapper(()=> {
            return Object.freeze(new Group(data.get(this).hostGroup.group, data.get(this).appUser, data.get(this).permObj));
        });
    }

    get members() {
        return this._readAttributeWrapper(()=> {
            if (Vincent.app.provider.checkPermissions(data.get(this).appUser, data.get(this).permObj, "w")) {
                return data.get(this).hostGroup.members;
            } else {
                return Object.freeze(data.get(this).hostGroup.members);
            }
        });
    }

    //set members(members) {
    //    return this._writeAttributeWrapper(()=> {
    //        if (Array.isArray(members)) {
    //            if (members.length > 0 && typeof members[0] === 'string') {
    //                data.get(this).hostGroup.members = members;
    //            } else {
    //                data.get(this).hostGroup.members.empty();
    //            }
    //        }
    //    });
    //}

    addMember(member) {
        return this._writeAttributeWrapper(()=> {
            try {
                if (typeof member === "string") {
                    var _user = Vincent.app.provider.managers.userManager.findValidUserByName(member);
                } else if (member instanceof User) {
                    _user = Vincent.app.provider.managers.userManager.findValidUserByName(member.name);
                }
                if (_user) {
                    data.get(this).hostGroup.addMember(_user);
                    return `${member} added to group ${this.group.name} members.`;
                } else {
                    return `User ${member.name ? member.name : member} was not found in valid users list.`;
                }
            } catch (e) {
                console.log(e);
            }
        });
    }

    inspect() {
        return {
            group: data.get(this).hostGroup.name,
            members: data.get(this).hostGroup.members
        }
    }

    toString() {
        return `{ group: ${this.group.name},members:${this.members} }`;
    }

    _readAttributeWrapper(func) {
        try {
            return Vincent.app.provider._readAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
        } catch (e) {
            //console.log(e);
            return false;
        }
    }

    _writeAttributeWrapper(func) {
        try {
            return Vincent.app.provider._writeAttributeCheck(data.get(this).appUser, data.get(this).permObj, func);
        } catch (e) {
            return false;
        }
    }
    
    get becomeUser(){
        return data.get(this).hostGroup.becomeUser;
    }

    set becomeUser(becomeUser){
        data.get(this).hostGroup.becomeUser = becomeUser;
    }

    get become(){
        return data.get(this).hostGroup.become;
    }

    set become(become){
        data.get(this).hostGroup.become = become;
    }

}

export default HostGroup;