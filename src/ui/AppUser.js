/**
 * Created by mark on 2016/04/27.
 */

import logger from '../Logger';
import fs from 'fs';
import child_process from 'child_process';
import mkdirp from 'mkdirp';

var data = new WeakMap();

class AppUser {

    constructor(name, groups, primaryGroup, keyPath) {

        if (!name || typeof name !== "string") {
            logger.logAndThrow("The parameter name is mandatory and must be a username string");
        }

        //if no user groups are defined place user in own group
        if (!groups) {
            groups = [name];
        }

        this.name = name;

        this.groups = groups;
        if (groups.indexOf("root") != -1 ||
            groups.indexOf("vadmin") != -1) {
            this.isAdmin = true;
        } else {
            this.isAdmin = false;
        }
        //set primary group is defined or default if not defined
        this.primaryGroup = primaryGroup ? primaryGroup : groups[0];
        if (this.groups.indexOf(this.primaryGroup) == -1) {
            this.groups.push(this.primaryGroup);
        }
        this.groups = Object.freeze(this.groups);

        data.set(this, keyPath); //set key loacation

        return Object.freeze(this);
    }

    hasKeys() {
        try {
            this.publicKey && this.privateKey
            return true;
        } catch (e) {
            return false;
        }
    }

    generateKeys(force=false) {
        return new Promise((resolve)=> {
            if (!this.hasKeys() || force) {
                var kpath = data.get(this) + "/" + this.name;
                if (force){
                    logger.warn(`Keys for ${this.name} are being forcibly overwritten.`);
                    try{
                        fs.unlinkSync(`${kpath}/${this.name}_vincent`);
                    }catch(e){};
                    try{
                        fs.unlinkSync(`${kpath}/${this.name}_vincent.pub`);
                    }catch(e){};
                    try {
                        fs.unlinkSync(`${kpath}`);
                    }catch(e){};
                }
                try {
                    let exists = fs.statSync(kpath);
                } catch (e) {
                    fs.mkdirSync(kpath, parseInt("700", 8));
                }
                var proc = child_process.spawn("/usr/bin/ssh-keygen", ["-t", "rsa", '-b', '2048', '-N', "", '-f', `${kpath}/${this.name}_vincent`]);
                proc.stderr.on('data', (data)=> {
                    logger.logAndThrow(`Could not create key pair for ${this.name} - ${data}.`);
                });
                proc.stdout.on('data', (data)=> {
                    logger.info(`Generated key pair for ${this.name}`);
                });
                proc.on('exit', ()=> {
                    let msg = `keys have been successfully generated for ${this.name}.`;
                    logger.info(msg);
                    resolve(msg);
                })
            } else{
                let msg =`Keys already exist for user ${this.name}`;
                logger.info(msg);
                resolve(msg);
            }
        });
    }

    get privateKey() {
        let tpath = data.get(this) + "/" + this.name +"/"+this.name+"_vincent";
        try {
            let exists = fs.statSync(tpath);
            return fs.readFileSync(tpath);
        } catch (e) {
            throw new Error(`Private key does not exists for ${this.user}.`);
        }
    }

    get publicKey() {
        let tpath = data.get(this) + "/" + this.name +"/"+this.name+"_vincent.pub";
        try {
            let exists = fs.statSync(tpath);
            return fs.readFileSync(tpath).toString();
        } catch (e) {
            throw new Error(`Public key does not exists for ${this.user}.`);
        }
    }

}

export default AppUser;