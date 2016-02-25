/**
 * Created by mark on 2016/02/21.
 */

import Config from 'Config';
import Provider from 'Provider';
import Loader from 'Loader';

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
        this.loader = new Loader(this.provider);
    }

}

var app = new Main();

