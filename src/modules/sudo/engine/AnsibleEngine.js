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
 
    }
}

export default AnsibleEngine;