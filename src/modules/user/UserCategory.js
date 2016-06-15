/**
 * Created by mark on 2016/05/30.
 */
import UserAccount from './UserAccount';
import User from './User';


class UserCategory  {

    constructor(name, userAccounts){
        if(typeof name!=='string' || ((userAccounts!==undefined) && ((userAccounts.length>0 && !userAccounts[0] instanceof UserAccount)))){
            throw new Error("Parameter name must be a string and parameter userAccounts must be an array of UserAccounts.");
        }
        this.name=name;
        this.userAccounts = userAccounts;
    }

    addReplaceUserAccount(userAccount){
        if (!userAccount instanceof UserAccount){
            throw new Error("Parameter userAccount must be of type UserAccount.");
        }
        this.userAccounts.find((tUserAccount,index,array)=>{
            if (userAccount.user.name===tUserAccount.user.name) {
                array.splice(index,1);
                return tuserAccount;
            }
        });
        this.userAccounts.push(userAccount);
    }


    export(){
        let obj={};
        obj.name =this.name;
        obj.config=[];
        this.userAccounts.forEach((user)=>{
            obj.config.push(user.export());
        });
        return obj;
    }

    findUserAccountForUser(user){
        if (!user instanceof User && typeof user !=='string'){
            throw new Error("Parameter user must be of type User or a user name string.");
        }
        user = user instanceof User? user.name: user;
        return this.userAccounts.find((tUserAccount)=>{
            if(tUserAccount.user.name == user){
                return tUserAccount;
            }
        });
    }

}

export default UserCategory;