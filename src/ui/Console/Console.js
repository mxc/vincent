/**
 * Created by mark on 2016/04/16.
 */

import repl from 'repl';
import {logger} from '../../Logger';
import ModuleLoader from '../../utilities/ModuleLoader';
import Config from './Config';
import Vincent from "../../Vincent";
import Ui from '../Ui';
import Host from '../../modules/host/ui/console/Host';
import dateFormat from 'dateformat';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import process from 'process';

class Console extends Ui {

    constructor(s, appUser) {
        super();//creates session object
        this.session.socket = s;
        this.session.appUser = appUser;
        this.session.passwords = {};
        this.session.cmd=[];
        let session = this.session;
        let options = {
            prompt: 'vincent:',
            useColors: true,
            terminal: true,
            useGlobal: false,
        };
        if (this.session.socket) {
            options.input = s;
            options.output = s;
        }
        this.cli = repl.start(options);
        let teval = this.cli.eval;
        let func = function (code, context, file, cb) {
            teval(code,context,file,(err,result)=>{
                if(!err && session.recording && !/^\s*$/.test(code) && /\n$/.test(code)){
                    code =code.replace("\n","");
                    session.cmd.push(code);
                }
                cb(err,result);
            });
        }.bind(this.cli);
        this.cli.eval=func;

        //defined command to set password for engine actions


        this.cli.defineCommand("password", {
            help: "Set the password for a host using user based",
            action: function (hostname) {
                let password = "";
                this.output.write("Password:");
                let listeners = this.input.listeners("data");
                this.input.removeAllListeners("data");
                let func = (data)=> {
                    if (data.toString() == "\r") {
                        if (!hostname || hostname == "") {
                            hostname = "default";
                        }
                        session.passwords[hostname] = password;
                        this.input.removeAllListeners("data");
                        for (var i = 0; i < this.listeners.length; i++) {
                            this.input.on("data", listeners[i]);
                        }
                        this.output.write("\n\r");
                    } else {
                        this.output.write("*");
                        password += data.toString();
                    }
                };
                this.input.on("data", func);
            }
        });

        this.cli.defineCommand("startrecording", {
            help: "Start recording a script file",
            action: function (filename) {
                if (session.recording) {
                    return "A recording session is currently in progress.";
                } else {
                    session.recording = true;
                }
                session.cmd = [];
                session.filename = filename ? `${filename}.vs` : `recording-${dateFormat(new Date(), "yyyy-mm-dd-HH:MM:ss")}.vs`;
            }
        });

        this.cli.defineCommand("stoprecording", {
            help: "Stop recording and save a script file",
            action: function () {
                if (!session.recording) {
                    return "There is no recording session currently in progress.";
                } else {
                    session.recording = false;
                }
                let cmds = session.cmd.join("\n");
                session.cmd = [];
                let currentPath = path.resolve(Vincent.app.provider.getDBDir(), "scripts", session.filename);
                session.filename = "";
                fs.writeFileSync(currentPath, cmds);
            }
        });

        let tcontext = this.cli.context;

        this.cli.defineCommand("runscript", {
            help: "Run a script file",
            action: function (filename) {
                try {
                    if (path.extname(filename) !== ".vs") {
                        filename = `${filename}.vs`;
                    }
                    filename = path.basename(filename);
                    let scriptpath = path.resolve(Vincent.app.provider.getDBDir(), "scripts", path.basename(filename));
                    let data = fs.readFileSync(scriptpath, 'utf-8');
                    this.eval(data.toString('utf-8'), tcontext, "repl", (err, results)=> {
                        if (err) {
                            this.outputStream.write(this.writer(err) + '\n');
                        } else {
                            this.outputStream.write(this.writer(results) + '\n');
                        }
                    });
                } catch (e) {
                    session.socket.write(`There was an error executing the script ${filename} - ${e.message ? e.message : e}`);
                }
            }.bind(this.cli)
        });


        this.cli.on('exit', ()=> {
            console.log("Vincent console exited");
            logger.info("Vincent console exited");
            process.exit();
        });

        this.cli.on('reset', (context)=> {
            // this.checkAccess(Roles.all);
            console.log("resetting context");
            logger.info("resetting context");
            this.initContext(context);
        });

        this.initContext(this.cli.context);
    }

    write(str) {
        this.session.socket.write(str);
    }

    initContext(context) {

        //set up vincent namespace in console
        context.v = {};

        context.v.config = new Config();

        //allow quit and exit for standalone cli mode only.
        //Killing the process in server mode would terminate the server
        if (Vincent.app.args.cli) {
            context.v.quit = function () {
                console.log("Vincent console exited");
                logger.info("Vincent console exited");
                process.exit();
            };

            context.v.exit = function () {
                console.log("Vincent console exited");
                logger.info("Vincent console exited");
                process.exit();
            };
        }


        //logout function available in server mode only
        if (Vincent.app.args.daemon) {
            context.v.logout = ()=> {
                this.session.socket.destroy();
            };
            context.v.quit = ()=> {
                this.session.socket.destroy();
            };
            context.v.exit = ()=> {
                this.session.socket.destroy();
            };
        }

        //set up the session namespace
        context.v.session = {};

        context.v.session.hasKeys = ()=> {
            return this.session.appUser.hasKeys();
        };
        context.v.session.generateKeys = (force)=> {
            this.session.appUser.generateKeys(force).then((result)=> {
                this.session.socket.write("\n" + result + "\n");
            });
            return "Key generation pending ...";
        };


        Object.defineProperty(context.v.session, "groups", {
            value: this.session.appUser.groups
        });
        Object.defineProperty(context.v.session, "whoami", {
            value: this.session.appUser.name
        });
        Object.defineProperty(context.v.session, "publicKey", {
            value: this.session.appUser.publicKey
        });
        Object.defineProperty(context.v.session, "publicKeyPath", {
            value: this.session.appUser.publicKeyPath
        });

        context.v.session.hasPassword = (hostname)=> {
            let host = hostname;
            if (hostname instanceof Host) {
                host = hostname.name;
            }
            return this.session.passwords[host] ? true : false;
        };

        //Load all hosts into memory
        context.v.loadAll = ()=> {
            try {
                if (Vincent.app.provider.loadAll()) {
                    return "Successfully loaded data.";
                } else {
                    return "There were errors during data load. Please see the log file for details";
                }
            } catch (e) {
                return `There were errors during data load. ${e.message ? e.message : e}`;
            }
        };

        //save all configurations
        context.v.saveAll = () => {
            let results = Vincent.app.provider.saveAll();
            return results.join("\n\r");
        };

        //load the per session context objects
        try {
            Vincent.app.provider.loader.callFunctionInBottomUpOrder((managerClass)=> {
                try {
                    let manager = Vincent.app.provider.getManagerFromClassName(managerClass);
                    manager.loadConsoleUIForSession(context.v, this.session);
                } catch (e) {
                    logger.warn(e);
                    logger.warn("module does not offer console ui");
                    return e;
                }
            });
        } catch (e) {
            console.log(e);
        }
    }
}

export default Console;