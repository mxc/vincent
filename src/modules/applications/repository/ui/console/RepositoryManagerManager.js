/**
 * Created by mark on 2016/07/31.
 */
import HostUI from '../../../../host/ui/console/Host';
import RepositoryManager from './RepositoryManager';
import Vincent from '../../../../../Vincent';

var data = new WeakMap();

class RepositoryManagerManager{
    
    constructor(session){
        let obj={};
        obj.session = session;
        data.set(this,obj);
        Vincent.app.converters.set("repository",RepositoryManager);
    }
    
    addRepositoryManagerToHost(host){
        if (host instanceof HostUI){
            try {
                let vHost = Vincent.app.provider.managers.hostManager.findValidHost(host.name,host.configGroup);
                let repoMan= Vincent.app.provider.managers.repositoryManagerManager.addRepositoryManagerToHost(vHost);
                if(repoMan){
                    return new RepositoryManager(repoMan,vHost,data.get(this).session);
                }
            }catch(e){
                data.get(this).session.console.outputError(e.message);
            }
        } else{
            data.get(this).session.console.outputError("Parameter host must be of type Host.")
        }
    }
    
    inspect(){
        return 'A manager for adding and removing software.'
    }
}

export default RepositoryManagerManager;