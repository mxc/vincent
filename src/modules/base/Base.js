class Base {

    getBooleanValue(val) {
        if (typeof val === 'string') {
            val = val.toLowerCase();
            if (val === 'yes' || val === 'true') {
                return true;
            } else if (val === 'no' || val == 'false') {
                return false;
            } else {
                throw new Error("Boolean value must be 'true/yes' or 'false/no'");
            }
        } else {
            throw new Error("Boolean value must be 'true/yes' or 'false/no'");
        }
    }

    idToJSON() {
        return '{ "name":' + this.data.name + ',' + '"state:"' + this.data.state + '}';
    }

    get source(){
        return this._source;
    }
    
}

export default Base;