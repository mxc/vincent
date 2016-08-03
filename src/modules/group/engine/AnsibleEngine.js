/**
 * Created by mark on 4/2/16.
 */
import AnsibleEngineComponent from '../../engines/AnsibleEngineComponent'

class AnsibleEngine extends AnsibleEngineComponent {

    constructor(provider) {
        super();
        this.provider = provider;
    }

    exportToEngine(host, tasks) {
        let hostGroups = this.provider.managers.groupManager.getHostGroups(host);
        if (hostGroups) {
            hostGroups.forEach((group)=> {
                let t = {
                    name: "addHostGroup - Group state check",
                    group: `name=${group.name} state=${group.state}`,
                };
                if (group.gid) {
                    t.group += ` gid={$group.gid}`;
                }
                this.appendBecomes(host, group, t);
                tasks.push(t);
            });
        }
    }

}

export default AnsibleEngine;