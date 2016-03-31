/**
 * Created by mark on 2016/02/21.
 */
import HostDef from './../../modules/base/HostComponent';
import SudoEntry from './../SudoEntry';
import Provider from './../../Provider';
import logger from './../../Logger';

class HostSudoEntry extends HostDef {

    constructor(provider,host, data) {
        super(provider);
        this.errors = [];
        if (!data && !data.userList && !Array.isArray(data.userList)) {
            logger.logAndThrow("The data def parameter for SudoEntry must have a userList array property");
        }
        this.data = new SudoEntry(data.name);
        data.userList.forEach((userEntry)=> {
            //determine if this is a group or user reference
            let added = false;
            if (userEntry.group) {
                let group = this.provider.managers.groupManager.findHostGroupByName(host,userEntry.group.name);
                if (group) {
                    this.data.addGroup(group);
                    added = true;
                }
            } else {
                let user = this.provider.managers.users.findHostUserByName(host,userEntry.user.name);
                if (user) {
                    this.data.addUser(user);
                    added = true;
                }
            }
            if (!added) {
                let name = userEntry.group ? userEntry.group.name : userEntry.user.name;
                logger.logAndAddToErrors('User entry for ${name} was not added for sudoer entry ' +
                    'as user or group is not valid for host', this.errors);
            }
        });
        this.data.commandSpec = data.commandSpec;
    }


    get sudoEntry() {
        return this.data;
    }

    clear() {
        this.data = {};
        this._export = {};
    }

}

export default HostSudoEntry;