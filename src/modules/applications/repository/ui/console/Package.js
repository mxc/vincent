/**
 * Created by mark on 2016/07/31.
 */

class Package{

    constructor(repoPackage) {
        this.data = {};
        this.data.package = repoPackage;
    }

    get name() {
        return this.data.package.name;
    };


    get state() {
        return this.data.package.state;
    }

    set name(name) {
        this.data.package.name = name;
    }

    set state(state) {
        thos.data.package.state = state;
    }

    inspect() {
        let obj={};
        obj.name=this.data.package.name;
        obj.state = this.data.package.state;
        return obj;
    }
    
}