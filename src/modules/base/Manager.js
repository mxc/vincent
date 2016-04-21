/**
 * Created by mark on 3/28/16.
 */


class Manager {
    
    // initialiseHost(host){
    //     throw new Error ("Method must be overridden in child object");
    // }
    
    updateHost(host,hosts,hostDef){
        throw new Error ("Method updateHost must be overridden in child object");
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

    loadConsoleUI(context){
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