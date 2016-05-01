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
                    become: 'yes'
                };
                if (group.gid) {
                    ansibleGroup.group += ` gid={$group.gid}`;
                }
                tasks.push(ansibleGroup);
            });
        }
    }

}

export default AnsibleEngine;