/**
 * Created by mark on 4/2/16.
 */
import EngineComponent from '../../base/EngineComponent';

class AnsibleEngine extends EngineComponent {

    constructor(provider) {
        super();
        this.provider = provider;
    }

    exportToEngine(host, tasks) {
        let hostGroups = this.provider.managers.groupManager.getHostGroups(host);
        if (hostGroups) {
            hostGroups.forEach((group)=> {
                let ansibleGroup = {
                    name: "Group state check",
                    group: `name=${group.name} state=${group.state}`,
                };
                if (group.gid) {
                    ansibleGroup.group += ` gid={$group.gid}`;
                }
                if(group.become){
                    ansibleGroup.become="true";
                    if(group.becomeUser){
                        ansibleGroup.becomeUser= group.becomeUser;
                    }else if(host.becomeUser){
                        ansibleGroup.becomeUser=host.becomeUser;
                    }
                }                
                tasks.push(ansibleGroup);
            });
        }
    }

}

export default AnsibleEngine;