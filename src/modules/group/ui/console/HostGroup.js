/**
 * Created by mark on 2016/04/17.
 */

import Vincent from '../../../../Vincent';
import HostGroupElement from '../../HostGroup';
import GroupElement from '../../Group';
import Group from  './Group';

const _hostGroup = Symbol("hostGroup");
const _appUser = Symbol("appUser");

class HostGroup {

    constructor(data,appUser) {
        this[_appUser] = appUser;
        if (typeof data === "string" || typeof data.group === "string" || data.group instanceof Group) {
            let groupname = '';
            if (typeof data === "string") {
                groupname = data;
            } else if (typeof data.group === 'string') {
                groupname = data.group;
            } else {
                groupname = data.group.name;
            }
            let group = Vincent.app.provider.groupManager.findValidGroupByName(groupname);
            if (group && data.members) {
                this[_hostGroup] = new HostGroupElement({
                    group: group,
                    members: data.members
                });
            } else if (group) {
                this[_hostGroup] = new HostGroupElement({group: group});
            } else {
                console.log(`The group ${group} is not a valid group`);
                throw new Error(`The grop ${data} is not a valid group`)
            }
        } else if (data instanceof HostGroupElement) {
            this[_hostGroup] = data;
        }
    }

    get group() {
        return new Group(this[_hostGroup].group);
    }

    get members() {
        return this[_hostGroup].members;
    }

    set members(members) {
        if (Array.isArray(members)) {
            if (members.length > 0 && typeof members[0] === 'string') {
                this[_hostGroup].members = members;
            } else {
                this[_hostGroup].members.empty();
            }
        }
    }

    addMember(member) {
        if (typeof member === "string") {
            var _user = app.provider.groupManager.findValidUserByName(member);
        } else if (member instanceof Group) {
            var _user = app.provider.groupManager.findValidUserByName(member.name);
        }
        if (_user) {
            this[_hostGroup].addMember(_user);
        } else {
            console.log("User was not found in valid users list.");
        }
    }

    inspect() {
        return {
            group: this.group.name,
            members: this.members
        }
    }

    toString() {
        return `{ group: ${this.group.name},members:${this.members} }`;
    }

}

export default HostGroup;