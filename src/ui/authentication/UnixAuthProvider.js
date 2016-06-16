/**
 * Created by mark on 2016/04/27.
 */
import AuthenticationProvider from './AuthenticationProvider';
import pam from 'authenticate-pam';
import child_process from 'child_process';

class UnixAuthProvider extends AuthenticationProvider{

    constructor(provider){
        super();
        this.provider = provider;
    }
    
    
    authenticate(username,password){
        this.username = username;
        return new Promise((resolve)=>{
           pam.authenticate(username,password,(err)=>{
               if (err){
                   //console.log(err);
                   resolve(false);
               }else {
                   resolve(true);
               }
           })
        });
    }
    
    getGroups(){
        let results = child_process.execSync(`id ${this.username} | egrep -o 'groups=.*'`);
        if (results) {
            let re = /(?:\(([a-z]*)\),?)/g;
            let groups = [];
            let match={};
            while (match = re.exec(results)){
                groups.push(match[1]);
            }
            return groups;
        }else{
            return [];
        }
    }

}

export default UnixAuthProvider;
