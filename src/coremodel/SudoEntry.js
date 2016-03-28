/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import Base from '../modules/base/Base';
import logger from '../Logger';
import Group from '../modules/group/Group';
import HostUser from '../modules/user/HostUser';
import HostGroup from '../modules/group/HostGroup';
import User from '../modules/user/User';

class SudoEntry extends Base {

    constructor(data) {
        super();
        this.data = {};
        this._export={};
        if (!data) {
            //this.data.name = data;
            this.data.userList = [];
            this._export.name=data;
            this._export.userList=[];
            return;
        }
        //if (!data.name) {
        //    throw new Error("A SudoEntry must have a name identifier.");
        //} else {
        //    this.data.name = data.name;
        //    this._export.name=data.name;
        //}
        if (Array.isArray(data.userList)) {
            this.data.userList = data.userList;
        } else {
            throw new Error("A SudoEntry must have a userList property of type array.")
        }
        if (data.userList) {
            this.data.commandSpec = data.commandSpec;
        } else {
            throw new Error("A SudoEntry must have a commandSpec property.")
        }
    }

    addUser(userObj) {
        if(!this.data.userList){
            this.data.userList=[];
        }
        if(!this._export.userList){
            this._export.userList=[];
        }
        if (userObj instanceof HostUser) {
            this.data.userList.push({user: userObj});
            this._export.userList.push({user: userObj.user.exportId()});
        }else if (userObj instanceof HostGroup) {
            this.data.userList.push({group: userObj});
            this._export.userList.push({group: userObj.group.exportId()});
        }else{
            throw new Error("The userObj must be of type HostUser or HostGroup")
        }
    }

    set commandSpec(data) {
        this.data.commandSpec = data;
        this._export.commandSpec=data;
    }

    export() {
        return this._export;
    }

    get entry() {
        let entry = '';
        let num = this.data.userList.length;

        this.data.userList.forEach((userEntry, index)=> {
            if (userEntry['group']) {
                entry = `%${userEntry['group'].name}`;
                if (index < num-1) {
                    entry+= ",";
                }
            } else {
                entry += userEntry['user'].name;
                if (index < num-1) {
                    entry+= ",";
                }
            }
        });
        entry+=` ALL = (${this.data.commandSpec.runAs})`;
        entry+= ` ${this.data.commandSpec.options} `;
        num = this.data.commandSpec.cmdList.length;
        this.data.commandSpec.cmdList.forEach((cmd,index)=> {
            entry+=cmd;
            if (index < num-1) {
                entry +=",";
            }
        });
        return entry;
    }

}

export default SudoEntry;