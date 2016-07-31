/**
 * Created by mark on 2016/02/21.
 */

import {VLogger} from '../../Logger';
import path from 'path';
import mkdirp from 'mkdirp';

class Engine  {

    constructor(provider) {
        this.provider = provider;
        this.logger = new VLogger();
        this.setupLogger();
    }

    setupLogger(){
        let runDir = this.provider.config.get("runlogdir");
        if (!runDir) runDir = this.provider.config.get("logdir");
        let runlog = this.provider.config.get("runlog");
        let runlogpath = path.resolve(this.provider.configDir,runDir?runDir:"logs");
        try {
            fs.statSync(runlogpath);
        }catch(e){
            mkdirp(runlogpath, parseInt("750", 8));
        }
        runlog = path.resolve(runlogpath,runlog ? runlog : "run.log");
        this.logger.setStream(runlog, "info");
    }


    run(host) {
        throw new Error("Method must be overridden in child object");
    }


    export(host) {
        throw new Error("Method must be overridden in child object");
    }

    getInfo(host) {
        throw new Error("Method must be overridden in child object");
    }
    
    getOperatingSystemFamily(host){
        throw new Error("Method must be overridden in child object");
    }

    log(msg) {
        this.logger.info(msg);
    }
}

export default Engine;