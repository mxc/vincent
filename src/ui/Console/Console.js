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

        //set up vincent namespace in console
        context.v = {};

        context.v.config = new Config();

        //allow quit and exit for standalone cli mode only.
        //Killling the process in server mode would terminate the server
        if (Vincent.app.args.cli) {
            context.v.quit = function () {
                console.log("Vincent console exited");
                logger.info("Vincent console exited");
                process.exit();
            };

            context.v.exit = function () {
                console.log("Vincent console exited");
                logger.info("Vincent console exited");
                process.exit();
            };
        }
        
        //logout function available in server mode only
        if (Vincent.app.args.daemon){
            context.v.logout=()=>{
                this.session.socket.destroy();
            };
            context.v.quit=()=>{
              this.session.socket.destroy();
            };
            context.v.exit=()=>{
                this.session.socket.destory();
            }
        }
        

        //Load all hosts into memory
        context.v.loadAll = ()=>{
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
        context.v.saveAll = () =>{
            return "Not yet implemented";
        };

        //load the per session context objects
        ModuleLoader.managerOrderedIterator((managerClass)=> {
            try {
                let name = managerClass.name.charAt(0).toLocaleLowerCase() + managerClass.name.slice(1);
                Vincent.app.provider.managers[name].loadConsoleUIForSession(context.v,this.session.appUser);
            } catch (e) {
                logger.warn(e);
                logger.warn("module does not offer console ui");
                return e;
            }
        },Vincent.app.provider);
    }

}

export default Console;