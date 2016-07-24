/**
 * Created by mark on 2016/05/30.
 */
import HostGroup from './HostGroup';
import User from '../user/User';

class GroupCategory {

    constructor(name,hostGroups){
        if(typeof name!=='string' || ((hostGroups!==undefined) && ((hostGroups.length>0 && !hostGroups[0] instanceof HostGroup)))){
            throw new Error("Parameter name must be a string and parameter userAccounts must be an array of HostGroup.");
        }
        this.name = name;
        this.hostGroups = hostGroups;
    }

    export(){
        let obj={};
        obj.name =this.name;
        obj.config=[];
        this.hostGroups.forEach((hostGroup)=>{
            obj.config.push(hostGroup.export());
        });
        return obj;
    }

    findUser(user){
        if(!(user instanceof User) && typeof user !=='string'){
            throw new Error("Parameter user must be of type User or a user name string.");
        }
        let users=[];
        this.hostGroups.forEach((hostGroup)=>{
            return hostGroup.members.find((user)=>{
                if (user.name == user){
                    if(!users.includes(user)){
                        users.push(user);
                    }
                    return user;
                }
            });
        });
        return users;
    }
}

export default GroupCategory;