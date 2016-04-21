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
            console.log("Vincent console exited");
            logger.info("Vincent console exited");
            process.exit();
        });

        this.cli.on('reset', (context)=> {
            console.log("resetting context");
            logger.info("resetting context");
            this.initContext(context);
        });

        this.initContext(this.cli.context);
    }

    initContext(context) {

        context.Host = Host;

        context.config = new Config();

        context.quit = function () {
            console.log("Vincent console exited");
            logger.info("Vincent console exited");
            process.exit();
        };

        context.exit = function () {
            process.exit();
        };

        context.loadAll = ()=>{
            if(session.getProvider().loadAll()){
                console.log("Successfully loaded datastore");
            }else{
                console.log("There were errors during datastore load.");
            }
        };

        ModuleLoader.managerOrderedIterator((managerClass)=> {
            try {
                let name = managerClass.name.charAt(0).toLocaleLowerCase() + managerClass.name.slice(1);
                session.getProvider().managers[name].loadConsoleUI(context);
            } catch (e) {
                logger.warn(e);
                logger.warn("module does not offer console ui");
                console.log(e);
            }
        },session.getProvider());
    }



}

export default Console;