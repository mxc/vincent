/**
 * Created by mark on 2016/02/21.
 */

import Console from './ui/Console/Console';
import Session from './ui/Session';
import Provider from './Provider';

class Main {

    constructor() {
        this.configDir;
        if (!this.processArguments()) {
            process.exit();
        }
        if (this.args.configdir) {
            this.provider = new Provider(ths.args.configdir);
        } else {
            this.provider = new Provider();
        }
        if (!this.configDir) {
            this.configDir = process.cwd();
        }
    }

    startConsole() {
        this.console = new Console();
    }

    processArguments() {
        let argslist = process.argv;
        this.args = {};
        let numargs = process.argv.length;
        if (numargs===2){
            this.args.cli=true;
            return true;
        }
        let counter = 2;
        let error = false;
        while (counter < numargs && !error) {
            let currarg = argslist[counter];
            switch (currarg) {
                case "--configdir":
                case "-c":
                    counter++;
                    if (argslist[counter].startsWith("-") | arglist[counter].startsWith("--")) {
                        this.showHelp();
                        this.error = true;
                        console.log("-c or --configdir requires a path value.");
                    } else {
                        this.args.configdir = argslist[counter];
                    }
                    break;
                case "--cli":
                case "-i":
                    this.args.cli = true;
                    break;
                case "-d":
                    this.args.daemon = true;
                    break;
                default:
                    console.log(`unrecognised argument ${currarg}`);
                    //this.showHelp();
                    //error = true;
            }
            counter++;
        }
        return !error;
    }

    showHelp() {
        console.log("Vincent takes the following arguments:")
        console.log("-c or --configdir: location of Vincent's configuration and database directory");
    }
}

//var session = new Session(new Provider());
var app = new Main();
var session = new Session(app.provider);
export {session};
if(app.args.cli){
    app.startConsole();
}

