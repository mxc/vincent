/**
 * Created by mark on 2016/02/21.
 */

import Provider from './Provider';
import Saver from './utilities/Saver';

class Main{

    constructor(){
        this.configDir;
        if (process.argv.length>2) {
            process.argv.forEach((param, index)=> {
                if (index > 1) {
                    if(param.contains("conf"));
                    this.configDir = param.substring(param.indexOf('='));
                }
            });
        }
        if (!this.configDir){
            this.configDir=process.cwd();
        }

        this.provider  = new Provider(this.configDir);
        this.saver = new Saver(this.provider);
    }

    load(){
        //this.loader.load();
    }

    save(){
            this.saver.export();
    }

}

var app = new Main();
app.load();
app.save();

