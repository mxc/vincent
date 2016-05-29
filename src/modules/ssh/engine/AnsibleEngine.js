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
        if (host.ssh) {
            tasks.push({
                name: "Ssh config PermitRoot state check",
                lineinfile: {
                    dest: '/etc/ssh/sshd_config',
                    regexp: '^PermitRootLogin yes|^PermitRootLogin no|^#PermitRootLogin yes',
                    line: `PermitRootLogin ${host.ssh.permitRoot}`
                },
                sudo: 'yes'
            });
            tasks.push({
                name: "Ssh config PermitPassword state check",
                lineinfile: {
                    dest: '/etc/ssh/sshd_config',
                    regexp: 'PasswordAuthentication yes|PasswordAuthentication no',
                    line: `PasswordAuthentication ${host.ssh.passwordAuthentication}`
                },
                sudo: 'yes'
            });
            if (host.ssh.validUsersOnly) {
                //api on refactor
                let userAccounts = this.provider.managers.userManager.getUserAccounts(host);
                let users = '';
                userAccounts.forEach((user, index)=> {
                    users += user.name;
                    if (index < userAccounts.length - 1) {
                        users += ",";
                    }
                });
                tasks.push({
                    name: "Ssh config ValidUsers state check",
                    lineinfile: {
                        dest: '/etc/ssh/sshd_config',
                        regexp: 'AllowUsers .*|#AllowUsers',
                        line: `AllowUsers ${users}`
                    },
                    sudo: 'yes'
                });
            }
        }
    }
}

export default AnsibleEngine;