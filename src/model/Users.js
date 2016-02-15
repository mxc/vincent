"use strict";

import User from './User';
import logger from './Logger';

class Users {

    constructor() {
        this.validUsers = [];
        this.userCategories=[];
    }

    add(user) {
        if (user instanceof User) {
            var mUser = this.findUserByName(user.name);
            if (!mUser) {
                mUser = this.findUserByUid(user.uid);
                if (mUser) {
                    logger.logAndThrow(`User ${user.name} already exists with uid ${mUser.uid}.`);
                }
                this.validUsers.push(user);
            } else {
                logger.logAndThrow(`User ${user.name} already exists.`);
            }
        } else {
            logger.logAndThrow('The parameter user needs to be of type User.');
        }
    }

    //find a user in an array of User objects.
    //if the 2nd parameter is not provided it defaults to the
    //array of validUsers contained in Users.
    findUser(user,validUsers) {
        if (!validUsers){
            validUsers = this.validUsers;
        }
        if (user instanceof User) {
            return validUsers.find((muser)=> {
                return muser.equals(user);
            });
        } else {
            logger.logAndThrow(`The parameter user is not an instance of User.`);
        }
    }

    findUserByName(user) {
        if (typeof user === 'string') {
            return this.validUsers.find((muser)=> {
                return muser.name === user;
            });
        } else {
            logger.logAndThrow(`The parameter user should be a user name string.`);
        }
    }

    findUserByUid(uid) {
        if (!uid) {
            logger.warn("uid is undefined.");
            return;
        }
        if (typeof uid === 'number') {
            return this.validUsers.find((muser)=> {
                return muser.uid === uid;
            });
        } else {
            logger.logAndThrow(`The parameter uid should be a number.`);
        }
    }

    toJSON(){
        var str = "[";
        this.validUsers.forEach((user,index)=>{
            str+=user.toJSON();
            if (index != this.validUsers.length-1){
                str+=",";
            }
        });
        str+="]";
        return str;
    }

    clear(){
        this.validUsers=[];
    }

}

export default Users;