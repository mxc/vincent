/**
 * Created by mark on 3/28/16.
 */

import {logger} from "../../Logger";
import Session from '../../ui/Session';

class Manager {
   
    loadHost(host, hosts, hostDef){
        throw new Error ("Method loadHost must be overridden in child object");
    }
    
    loadFromFile(){
        throw new Error ("Method loadFromFile must be overridden in child object");
    }

    loadFromJson(data){
        throw new Error ("Method loadFromJson must be overridden in child object");
    }
    exportToEngine(engine,host,struct){
        throw new Error ("Method exportToEngine must be overridden in child object");
    }
    
    clear(){
        throw new Error ("Method clear must be overridden in child object");
    }

    loadConsoleUIForSession(context,session){
        if(!(session instanceof Session)){
            logger.logAndThrow("Parameter session must be an instance of Session.");
        }
    }

   
    loadWebUI(){
        throw new Error ("Method loadWebUI must be overridden in child object");
    }

    static getDependencies(){
        throw new Error ("Method getDependencies must be overridden in child object");
    }
    
   
    deleteEntity(hc){
        throw new Error ("Method getDependencies must be overridden in child object");
    }
    
    entityStateChange(hc){
        throw new Error ("Method getDependencies must be overridden in child object");  
    }
}

export default Manager;