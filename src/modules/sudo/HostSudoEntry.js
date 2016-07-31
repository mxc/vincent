/**
 * Created by mark on 2016/02/21.
 */
import HostComponent from './../base/HostComponent';
import SudoEntry from './SudoEntry';
import {logger} from './../../Logger';


class HostSudoEntry extends HostComponent {

    constructor(provider, host, data) {
        super(provider,data);
        this.errors = [];
        if (!data && !data.userList && !Array.isArray(data.userList) && !data instanceof SudoEntry) {
            logger.logAndThrow("The data parameter for SudoEntry must have a userList array property.");
        }
        if (!data.commandSpec) {
            logger.logAndThrow("The data parameter for SudoEntry must have a commandSpec array property.");
        }

        let entry = {};
        if (data instanceof SudoEntry) {
            entry = data;
        } else {
            entry = new SudoEntry(this.provider, data);
        }
        entry.userList.users.forEach((userEntry)=> {
            //determine if this is a group or user reference
            let user = this.provider.managers.userManager.findUserAccountForHostByUserName(host, userEntry.name);
            if (!user) {
                entry.removeUserGroup(userEntry);
                logger.logAndAddToErrors(`User ${userEntry.name} was not added to sudoer entry ' +
                    'as the user is not valid for host`, this.errors);
            }
        });
        entry.userList.groups.forEach((group)=> {
            let vgroup = this.provider.managers.groupManager.findHostGroupByName(host, group.name);
            if (!vgroup) {
                entry.removeUserGroup(group);
                logger.logAndAddToErrors(`Group ${group.name} was not added to sudoer entry ' +
                    'as the group is not valid for host`, this.errors);
            }
        });
        this.data.entry = entry;
    }


    get sudoEntry() {
        return this.data.entry;
    }

    get userList() {
        return this.data.entry.userList;
    }

    get users() {
        return this.data.entry.userList.users;
    }

    get groups() {
        return this.data.entry.userList.groups;
    }

    get commandSpec() {
        return this.data.entry.commandSpec;
    }

    clear() {
        this.data = {};
    }

    export() {
        let obj = this.data.entry.export();
        super.export(obj);
        return obj;
    }
}

export default HostSudoEntry;