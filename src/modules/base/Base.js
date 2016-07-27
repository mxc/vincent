class Base {

    getBooleanValue(val) {

        let vtrue = /yes|true/;
        let vfalse = /no|false/;
        if(val==undefined){
            return false;
        }
        if (typeof val === 'string') {
            val = val.toLowerCase();
            if (vtrue.test(val)) {
                return true;
            } else if (vfalse.test(val)) {
                return false;
            } else {
                throw new Error("Boolean value must be 'true/yes' or 'false/no'");
            }
        } else if(typeof val =='boolean'){
            return val;
        }else  throw new Error("Boolean value must be 'true/yes' or 'false/no'");
    }

    idToJSON() {
        return '{ "name":' + this.data.name + ',' + '"state:"' + this.data.state + '}';
    }


}

export default Base;