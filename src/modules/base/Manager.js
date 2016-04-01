/**
 * Created by mark on 3/28/16.
 */


class Manager {
    initialiseHost(host){
        throw new Error ("Method must be overridden in child object");
    }
    
    updateHost(host,hosts,hostDef,){
        throw new Error ("Method must be overridden in child object");
    }
    
    loadFromFile(){
        throw new Error ("Method must be overridden in child object");        
    }
    
}

export default Manager;