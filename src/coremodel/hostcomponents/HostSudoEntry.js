/**
 * Created by mark on 2016/02/21.
 */
import HostDef from './HostDef';
import SudoEntry from './../SudoEntry';
import Provider from './../../Provider';
import logger from './../../Logger';

class HostSudoEntry extends HostDef {

    constructor(host, data) {
        super(host);
        this.errors = [];
        if (!data.userList || !Array.isArray(data.userList)) {
            logger.logAndThrow("The data def parameter for SudoEntry must have a userList array property");
        }
        this.data = new SudoEntry();
        data.userList.forEach((userEntry)=> {
            //determine if this is a group or user reference
            let added = false;
            if (userEntry.group) {
                let group = host.findGroup(userEntry.group.name);
                if (group) {
                    this.data.addUser(group);
                    added = true;
                }
            } else {
                let user = host.findUser(userEntry.user.name);
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