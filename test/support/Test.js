/**
 * Created by mark on 4/3/16.
 */
'use strict';

var path = require("path");

class Test {

    getDir(){
            let dir = __dirname.split(path.sep);
            dir.pop();
            console.log(dir.join(path.sep));
    }
}


var test = new Test();
test.getDir();