/**
 * Created by mark on 2016/04/16.
 */

import repl from 'repl';
import logger from '../../Logger';
import ModuleLoader from '../../utilities/ModuleLoader';
import Config from './Config';
import Vincent from "../../Vincent";
import Ui from '../Ui';

class Console extends Ui {

    constructor(s,appUser) {
        super();//creates session object
        this.session.socket =s;
        this.session.appUser = appUser;
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

        this.cli.on('exit', ()=> {
            console.log("Vincent console exited");
            logger.info("Vincent console exited");
            process.exit();
        });

        this.cli.on('reset', (context)=> {
           // this.checkAccess(Roles.all);
            console.log("resetting context");
            logger.info("resetting context");
            this.initContext(context);
        });

        this.initContext(this.cli.context);
    }

    initContext(context) {

        //context.Host = Host;

        context.config = new Config();

        //allow quit and exit for standalone cli mode only.
        //Killling the process in server mode would terminate the server
        if (Vincent.app.args.cli) {
            context.quit = function () {
                console.log("Vincent console exited");
                logger.info("Vincent console exited");
                process.exit();
            };

            context.exit = function () {
                console.log("Vincent console exited");
                logger.info("Vincent console exited");
                process.exit();
            };
        }
        
        //logout funciton available in server mode only
        if (Vincent.app.args.daemon){
            context.logout=()=>{
                this.session.socket.destroy();
            }
        }

        //Load all hosts into memory
        context.loadAll = ()=>{
          try {
              if (Vincent.app.provider.loadAll()) {
                  console.log("Successfully loaded data store");
              } else {
                  console.log("There were errors during data store load.");
              }
          }catch(e){
              console.log(`There were errors during data store load. ${e.message? e.message : e}`);
          }
        };

        //save all configurations
        context.saveAll = () =>{
            console.log("Not yet implemented");
        };

        ModuleLoader.managerOrderedIterator((managerClass)=> {
            try {
                let name = managerClass.name.charAt(0).toLocaleLowerCase() + managerClass.name.slice(1);
                Vincent.app.provider.managers[name].loadConsoleUI(context,this.session.appUser);
            } catch (e) {
                logger.warn(e);
                logger.warn("module does not offer console ui");
                console.log(e);
            }
        },Vincent.app.provider);
    }

}

export default Console;