/**
 * Created by mark on 4/2/16.
 */


import EngineComponent from '../../base/EngineComponent';

class AnsibleEngine extends EngineComponent {

    constructor(provider) {
        super();
        this.provider = provider;
    }
    
    exportToEngine(host,tasks){
        let userAccounts = this.provider.managers.userManager.getUserAccounts(host);
        if (userAccounts) {
            userAccounts.forEach((user)=> {
                let ansibleUser = {
                    name: "User account state check",
                    user: `name=${user.name} state=${user.state}`,
                    become: 'yes'
                };
                if (user.uid) {
                    ansibleUser.user += ` uid={$user.uid}`;
                }
                tasks.push(ansibleUser);
                if (user.authorized_keys) {
                    user.authorized_keys.forEach((authorizedUser)=> {
                        let ansibleAuthorizedKey = {
                            name: "User authorized key state check",
                            authorized_key: {
                                user: `${user.name}`,
                                key: `{{ lookup('file','${authorizedUser.keyPath}') }}`,
                                manage_dir: 'yes',
                                state: `${authorizedUser.state}`
                            },
                            become: 'yes'
                        };
                        tasks.push(ansibleAuthorizedKey);
                    });
                }
            });
        }
    }

}

export default AnsibleEngine;