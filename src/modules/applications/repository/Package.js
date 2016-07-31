/**
 * Created by mark on 2016/07/31.
 */
class Package {

    constructor(name, state) {
        this.data = {};
        this.data.name = name;
        this.data.state = state;
    }

    get name() {
        return this.data.name;
    };


    get state() {
        return this.data.state;
    }

    set name(name) {
        this.data.name = name;
    }

    set state(state) {
        thos.data.state = state;
    }

    export() {
        return this.data;
    }

}

export default Package;