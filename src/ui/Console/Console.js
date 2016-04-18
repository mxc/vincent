/**
 * Created by mark on 2016/04/16.
 */

import repl from 'repl';
import Provider from '../../Provider';
import Host from './../../modules/host/ui/console/Host';
import User from './../../modules/user/ui/console/User';
import HostManager from './../../modules/host/ui/console/HostManager';
import Manager from './../../modules/base/Manager';
import logger from '../../Logger';
import {session} from '../../Index';
import ModuleLoader from '../../utilities/ModuleLoader';
import Config from './Config';

class Console {

    constructor() {
        this.cli = repl.start({
            prompt: 'vincent:'
        });

        this.cli.on('exit', ()=> {
            console.log("good bye");
            process.exit();
        });

        this.cli.on('reset', (context)=> {
            console.log("resetting context");
            this.initContext(context);
        });

        this.initContext(this.cli.context);
    }

    initContext(context) {
        context.config = new Config();

        context.quit = function () {
            process.exit();
        };

        context.exit = function () {
            process.exit();
        };

        let loaded ={};
        ModuleLoader.modules.forEach((manager)=>{
            ModuleLoader.callFunctionInManagerDependencyOrder(manager,
                session.getProvider(), loaded, (managerClass)=> {
                    try {
                        let name = managerClass.name.charAt(0).toLocaleLowerCase()+ managerClass.name.slice(1);
                        //console.log(session.getProvider().managers[name]);
                        session.getProvider().managers[name].loadConsoleUI(context);
                    }catch(e){
                        logger.warn(e);
                        logger.warn("module does not offer console ui");
                        console.log(e);
                    }
                });
        });
    }

}

export default Console;