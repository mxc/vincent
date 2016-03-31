/**
 * Created by mark on 2016/02/21.
 */


class Engine {

    constructor(){

    }

    run(host){
        throw new Error ("Method must be overridden in child object");
    }


    export(host){
        throw new Error ("Method must be overridden in child object");
    }

    getInfo(host){
        throw new Error ("Method must be overridden in child object");
    }
}

export default Engine;