/**
 * Created by mark on 3/28/16.
 */


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
    
    loadEngines(dir){
        throw new Error ("Method loadEngines must be overridden in child object");
    }
    
    clear(){
        throw new Error ("Method clear must be overridden in child object");
    }

    loadConsoleUIForSession(context,appUser){
        throw new Error ("Method loadConsoleUI must be overridden in child object");
    }

   
    loadWebUI(){
        throw new Error ("Method loadWebUI must be overridden in child object");
    }

    static getDependencies(){
        throw new Error ("Method getDependencies must be overridden in child object");
    }
}

export default Manager;