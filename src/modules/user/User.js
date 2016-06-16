"use strict";

import logger from './../../Logger';
import Base from './../base/Base';

class User  {
    /*
     Parameter can be user name or data structure:
     {
        name: <username>,
        stat: <"present"|"absent">,
        uid: <int>,
        key: <path to user's public key
     }
     */
    constructor(data) {
        //super();
        //check if we were provided with a user name or a data object
        if (typeof data === 'string') {
            var valid = /\w/;
            if (!valid.test(data)) {
                throw new Error(`${data} is an invalid user name`);
            }
            this.data = {
                name: data,
                state: "present",
                key: undefined,
                uid: undefined
            };
            return;
        }

        if (!data.name) {
            logger.logAndThrow("The parameter data must be a user name or an object with a mandatory property \"name\".");
        }

        if (!data.state) {
            data.state = "present";
        } else if (data.state != "present" && data.state != "absent") {
            logger.logAndThrow("User state must be \"present\" or \"absent\".");
        }

        if (data.uid && typeof data.uid !== 'number') {
            logger.logAndThrow("Uid must be a number.");
        }

        this.data = {
            name: data.name,
            key: data.key,
            uid: data.uid,
            state: data.state ? data.state : "present"
        };
    }

    get name() {
        return this.data.name;
    }

    get state() {
        return this.data.state;
    }

    get key() {
        return this.data.key;
    }

    set key(key) {
        this.data.key = key;
    }

    get uid() {
        return this.data.uid;
    }

    merge(user) {
        if (user.name !== this.data.name) {
            logger.logAndThrow(`User ${user.name} does not match ${this.data.name}`);
        } else {
            if (!this.data.key && user.key) {
                this.data.key = user.key
            }

            if (!this.data.uid) {
                this.data.uid = user.uid;
            }

            if (this.data.state === 'absent' || user.state == "absent") {
                this.data.state = "absent";
            } else {
                this.data.state = "present";
            }
        }
        return this;
    }

    clone() {
        return new User(this.data);
    }

    export() {
        return this.data;
    }

    exportId() {
        return {name: this.data.name, state: this.data.state};
    }
}

export default User;