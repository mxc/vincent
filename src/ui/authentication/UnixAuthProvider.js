/**
 * Created by mark on 2016/04/27.
 */
import AuthenticationProvider from './AuthenticationProvider';
import pam from 'authenticate-pam';
import child_process from 'child_process';
import logger from '../../Logger';

class UnixAuthProvider extends AuthenticationProvider {

    constructor(provider) {
        super();
        this.provider = provider;
    }


    authenticate(username, password) {
        return new Promise((resolve)=> {
            pam.authenticate(username, password, (err)=> {
                if (err) {
                    logger.warn(err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        });
    }

/*    getKeys(username, password) {
        return new Promise((resolve)=> {
            let uid = child_process.execSync(`id -u ${username}`, {timeout: 100});
            if (uid) {
                var publicKey = undefined;
                var proc = child_process.spawn("/bin/cat", [username]);
                proc.stdout.on('data', (data)=> {
                    if (data.toString() == "Password:") {
                        proc.stdin.write(password);
                        proc.stdin.write('/bin/cat ~/.ssh/id_rsa.pub');
                    } else {
                        publicKey = data.toString();
                        proc.close();
                        resolve(publicKey)
                    }
                });
                proc.stderr.on('data',(data)=>{
                   logger.logAndThrow(new Error(data));
                });
                proc.on("close",(code)=>{
                    logger.info(code);
                })
            } else {
                logger.logAndThrow(`Error retrieving ${username}'s uid for key retrieval.`);
            }
        });
    };*/

    //User standard unix utils for account management for now
    changePassword(username, password) {
        throw new Error("not yet implemented");
    }

    getGroups(username) {
        let results = child_process.execSync(`id ${username} | egrep -o 'groups=.*'`, {timeout: 100});
        if (results) {
            let re = /(?:\(([a-z]*)\),?)/g;
            let groups = [];
            let match = {};
            while (match = re.exec(results)) {
                groups.push(match[1]);
            }
            return groups;
        } else {
            return [];
        }
    }

}

export default UnixAuthProvider;
