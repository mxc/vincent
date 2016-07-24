class Base {

    getBooleanValue(val) {
        if (typeof val === 'string') {
            val = val.toLowerCase();
            if (val == 'yes' || val == 'true') {
                return true;
            } else if (val === 'no' || val == 'false') {
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