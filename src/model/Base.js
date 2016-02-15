
class Base{

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
}

export default Base;