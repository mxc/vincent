/**
 * Created by mark on 4/2/16.
 */


import AnsibleEngineComponent from '../../engines/AnsibleEngineComponent';

class AnsibleEngine extends AnsibleEngineComponent {

    constructor(provider) {
        super();
        this.provider = provider;
    }

    exportToEngine(host, tasks) {
        try{
            var ssh =host.getConfig("ssh");
        }catch(e){
            return;
        }
        if (ssh) {
            let t = {
                name: "Ssh config PermitRoot state check",
                lineinfile: {
                    dest: '/etc/ssh/sshd_config',
                    regexp: '^#?PermitRootLogin .*',
                    line: `PermitRootLogin ${ssh.permitRoot=="without-password"?ssh.permitRoot : ssh.permitRoot? "yes":"no"}`
                }
            };

            this.appendBecomes(host,ssh,t);
            tasks.push(t);

            t = {
                name: "Ssh config PermitPassword state check",
                lineinfile: {
                    dest: '/etc/ssh/sshd_config',
                    regexp: '^#?PasswordAuthentication',
                    line: `PasswordAuthentication ${ssh.passwordAuthentication}`
                }
            };
            this.appendBecomes(host,ssh,t);
            tasks.push(t);

            if (ssh.validUsersOnly) {
                t = {
                    name: "Ssh config ValidUsers state check",
                    lineinfile: {
                        dest: '/etc/ssh/sshd_config',
                        regexp: '^#?AllowUsers .*',
                        line: `AllowUsers ${ssh.validUsers.join(",")}`
                    }
                };
                this.appendBecomes(host,ssh,t);
                tasks.push(t);
            }
        }
    }
}

export   default AnsibleEngine;