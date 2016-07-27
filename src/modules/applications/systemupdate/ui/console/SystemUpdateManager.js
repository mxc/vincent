/**
 * Created by mark on 2016/07/25.
 */

import Host from '../../../../host/Host';
import HostUI from '../../../../host/ui/console/Host';
import Debian from '../../Debian';
import Redhat from '../../Redhat';

class SystemUpdateManager{
    
    addSystemUpdateConfig(host){
        if (host instanceof HostUI){
               if(hostUI.ofFamily.toLowerCase()=="debian"){
                   Vincent.app.provider.managers.systemUpdateManager.addSystemUpdateToHost(host,new Debian(Vincent.));
               }else if (hostUI.ofFamily.toLowerCase()=="redhat"){
                   Vincent.app.provider.managers.systemUpdateManager.addSystemUpdateToHost(host,new Redhat());
               }else{

               }
        }
    }

}

export default SystemUpdateManager;