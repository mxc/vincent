/**
 * Created by mark on 2016/02/21.
 */

import Console from './ui/Console/Console';
import Session from './ui/Session';
import Provider from './Provider';
import logger from './Logger';
import readline from 'readline';
import child_process from 'child_process';

class Main {

    constructor() {
        //this.configDir;
        if (!this.processArguments()) {
            process.exit();
        }
        if (this.args.configdir) {
            this.provider = new Provider(this.args.configdir);
        } else {
            this.provider = new Provider();
        }
        if (!this.configDir) {
            this.configDir = process.cwd();
        }
    }

    startServer(){
        var options = {
            key: fs.readFileSync(this.conf),
            cert: fs.readFileSync('public-cert.pem')
        };

        tls.createServer(options, function (s) {
            s.write(msg+"\n");
            s.pipe(s);
        }).listen(8000);
    }

    startConsole() {
        logger.info("Starting Vincent console");
        this.console = new Console();
    }

    processArguments() {
        let argslist = process.argv;
        this.args = {
            cli:true //cli is the default mode if not specified
        };
        let numargs = process.argv.length;
        //if (numargs === 2) {
        //    this.args.cli = true;
        //    return true;
        //}
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
                    this.args.cli=false;
                    break;
                case "--username":
                case "-u":
                    this.args.username = argslist[++counter];
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
        console.log("-u or --username: username for authentication");
    }
}

var app = new Main();
var session = new Session(app.provider);
export {session};
if(app.args.cli){
    app.startConsole();
}

