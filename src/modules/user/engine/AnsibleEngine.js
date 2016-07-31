/**
 * Created by mark on 4/2/16.
 */


import AnsibleEngineComponent from '../../engines/AnsibleEngineComponent';

class AnsibleEngine extends AnsibleEngineComponent {

    constructor(provider) {
        super();
        this.provider = provider;
    }
    
    exportToEngine(host,tasks){
        let userAccounts = this.provider.managers.userManager.getUserAccounts(host);
        if (userAccounts) {
            userAccounts.forEach((user)=> {
                let ansibleUser = {
                    name: "addUserAccount - User account state",
                    user: `name=${user.name} state=${user.state}`
                };
                if(user.become){
                    ansibleUser.become="true";
                    if(user.becomeUser){
                        ansibleUser.becomeUser= user.becomeUser;
                    }else if(host.becomeUser){
                        ansibleUser.becomeUser=host.becomeUser;
                    }
                }
                if (user.uid) {
                    ansibleUser.user += ` uid={$user.uid}`;
                }
                tasks.push(ansibleUser);
                if (user.authorized_keys) {
                    user.authorized_keys.forEach((authorizedUser)=> {
                        let ansibleAuthorizedKey = {
                            name: "addUserAccount - User authorized key state check",
                            authorized_key: {
                                user: `${user.name}`,
                                key: `{{ lookup('file','${authorizedUser.keyPath}') }}`,
                                manage_dir: 'yes',
                                state: `${authorizedUser.state}`
                            }
                        };
                        if(user.become){
                            ansibleAuthorizedKey.become="true";
                            if(user.becomeuser){
                                ansibleAuthorizedKey.becomeUser= user.becomeUser;
                            }else if(host.becomeUser){
                                ansibleAuthorizedKey.becomeUser=host.becomeUser;
                            }
                        }
                        tasks.push(ansibleAuthorizedKey);
                    });
                }
            });
        }
    }

}

export default AnsibleEngine;