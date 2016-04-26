/**
 * Created by mark on 2016/04/16.
 */

import repl from 'repl';
import Host from './../../modules/host/ui/console/Host';
import logger from '../../Logger';
import ModuleLoader from '../../utilities/ModuleLoader';
import Config from './Config';
import {app} from "../../Vincent";
import Ui from '../Ui';

class Console extends Ui {

    constructor(s) {
        super();//creates session object
        this.session.socket =s;
        let options  = {
            prompt: 'vincent:',
            useColors: true,
            terminal: true,
            useGlobal:false
        };
        if (this.session.socket){
            options.input=s;
            options.output=s;
        }
        this.cli = repl.start(options);

        //this.cli.on('uncaughtException',(err) =>{
        //    console.log("Vincent could not process your request.");
        //});

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


        if (app.args.cli) {
            context.quit = function () {
                console.log("Vincent console exited");
                logger.info("Vincent console exited");
                console.log("\n\r");
                process.exit();
            };
        }
        
        if (app.args.daemon){
            context.logout=()=>{
                this.session.socket.destroy();
            }
        }

        context.exit = function () {
            process.exit();
        };

        context.loadAll = ()=>{
          try {
              if (app.provider.loadAll()) {
                  console.log("Successfully loaded data store");
              } else {
                  console.log("There were errors during data store load.");
              }
          }catch(e){
              console.log(`There were errors during data store load. ${e.message? e.message : e}`);
          }
        };

        context.saveAll = () =>{
            console.log("Not yet implemented");
        };

        ModuleLoader.managerOrderedIterator((managerClass)=> {
            try {
                let name = managerClass.name.charAt(0).toLocaleLowerCase() + managerClass.name.slice(1);
                app.provider.managers[name].loadConsoleUI(context);
            } catch (e) {
                logger.warn(e);
                logger.warn("module does not offer console ui");
                console.log(e);
            }
        },app.provider);
    }

}

export default Console;