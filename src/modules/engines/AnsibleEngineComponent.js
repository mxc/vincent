/**
 * Created by mark on 2016/07/24.
 */

import EngineComponent from '../base/EngineComponent';
    
class AnsibleEngineComponent extends EngineComponent {

    appendBecomes(host,comp,engineComp) {
        if (comp.become) {
            engineComp.become = "true";
            if (comp.becomeUser) {
                engineComp.becomeUser = user.becomeUser;
            } else if (host.becomeUser) {
                engineComp.becomeUser = host.becomeUser;
            }
        }
    }
}

export default AnsibleEngineComponent;