/**
 * Created by mark on 2016/04/16.
 */

import repl from 'repl';
import {logger} from '../../Logger';
import Config from './Config';
import Vincent from "../../Vincent";
import Ui from '../Ui';
import Host from '../../modules/host/ui/console/Host';
import dateFormat from 'dateformat';
import path from 'path';
import fs from 'fs';
import process from 'process';
import util from 'util';
import chalk from 'chalk';

class Console extends Ui {

    constructor(s, appUser) {
        super();//creates session object
        this.session.socket = s;
        this.session.appUser = appUser;
        let options = {
            prompt: 'vincent:',
            useColors: true,
            terminal: true,
            useGlobal: false,
            ignoreUndefined: true
        };

        if (this.session.socket) {
            options.input = s;
            options.output = s;
        }
        this.cli = repl.start(options);
        this.session.console = this;
        let origEval = this.cli.eval;
        let func = (code, context, file, cb)=> {
            origEval(code, context, file, (err, result)=> {
                if (!err && this.session.recording && !/^\s*$/.test(code) && /\n$/.test(code)) {
                    code = code.replace("\n", "");
                    this.session.cmd.push(code);
                }
                cb(err, result);
            });
        };
        this.cli.eval = func;
        // this.cli.writer = function (output) {
        //     return util.inspect(output, {
        //         colors: true
        //     });
        // };

        this.cli._domain.removeAllListeners("error");
        this.cli._domain.on("error", (e)=> {
            logger.error(e.message? e.message: e);
            this.cli.outputStream.write(`${chalk.styles.red.open}${e.message || e}${chalk.styles.red.close} \n`);
            this.cli._currentStringLiteral = null;
            this.cli.bufferedCommand = '';
            this.cli.lines.level = [];
            this.cli.displayPrompt();
        });

        //defined command to set password for engine actions

        this.cli.defineCommand("password", {
            help: "Set the password for a host using user based",
            action: (hostname) => {
                let password = "";
                this.cli.output.write("Password:");
                let listeners = this.cli.input.listeners("data");
                this.cli.input.removeAllListeners("data");
                let func = (data)=> {
                    if (data.toString() == "\r") {
                        if (!hostname || hostname == "") {
                            hostname = "default";
                        }
                        this.session.passwords[hostname] = password;
                        this.cli.input.removeAllListeners("data");
                        for (var i = 0; i < listeners.length; i++) {
                            this.cli.input.on("data", listeners[i]);
                        }
                        this.outputSuccess(`\nPassword added for ${hostname ? hostname : "default"}.`);
                    } else {
                        this.cli.output.write("*");
                        password += data.toString();
                    }
                };
                this.cli.input.on("data", func);
            }
        });

        this.cli.defineCommand("startrecording", {
            help: "Start recording a script file",
            action: (filename)=> {
                if (this.session.recording) {
                    this.outputError(`A recording session is currently in progress.`);
                } else {
                    this.session.recording = true;
                    this.session.cmd = [];
                    this.session.filename = filename ? `${filename}.vs` : `recording-${dateFormat(new Date(), "yyyy-mm-dd-HH:MM:ss")}.vs`;
                    this.outputSuccess(`Recording to ${this.session.filename}.`);
                }
            }
        });

        this.cli.defineCommand("stoprecording", {
            help: "Stop recording and save a script file",
            action: (name)=> {
                if (!this.session.recording) {
                    this.outputError(`There is no recording session currently in progress.`);
                } else {
                    this.session.recording = false;
                    let cmds = this.session.cmd.join("\n");
                    this.session.cmd = [];
                    let currentPath = path.resolve(Vincent.app.provider.getDBDir(), "scripts", this.session.filename);
                    try {
                        fs.writeFileSync(currentPath, cmds);
                    } catch (e) {
                        this.cli.outputStream.write(e);
                    }
                    this.outputSuccess(`Saved to ${this.session.filename}.`);
                    this.session.filename = "";
                }
            }
        });

        this.cli.defineCommand("runscript", {
            help: "Run a script file",
            action: (filename)=> {
                if (!filename) {
                    this.outputError("Please privde a script to run.");
                    return;
                }
                try {
                    if (path.extname(filename) !== ".vs") {
                        filename = `${filename}.vs`;
                    }
                    filename = path.basename(filename);
                    let scriptpath = path.resolve(Vincent.app.provider.getDBDir(), "scripts", path.basename(filename));
                    let data = fs.readFileSync(scriptpath, 'utf-8');
                    this.cli.eval(data.toString('utf-8'), this.cli.context, "repl", (err, results)=> {
                        if (err) {
                            this.cli.outputStream.write(this.cli.writer(err));
                        } else {
                            this.cli.outputStream.write(this.cli.writer(results));
                        }
                        this.cli.displayPrompt();
                    });
                } catch (e) {
                    this.outputError(`There was an error executing the script ${filename} - ${e.message ? e.message : e}`);
                    return;
                }
            }
        });

        this.cli.on('exit', ()=> {
            logger.info("Vincent console exited");
            process.exit();
        });

        this.cli.on('reset', (context)=> {
            // this.checkAccess(Roles.all);
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
                logger.info("Vincent console exited");
                process.exit();
            };

            context.v.exit = function () {
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
                this.cli.output.write("\n" + this.cli.writer(result) + "\n", 'utf-8');
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
                    this.outputWarning("There were errors during data load. Please see the log file for details");
                }
            } catch (e) {
                this.outputError(`There were errors during data load. ${e.message ? e.message : e}`);
                logger.error(e.message ? e.message : e);
            }
        };

        //save all configurations
        context.v.saveAll = () => {
            let results = Vincent.app.provider.saveAll();
            return results;
        };

        //load the per session context objects
        try {
            Vincent.app.provider.loader.callFunctionInBottomUpOrder((managerClass)=> {
                try {
                    let manager = Vincent.app.provider.getManagerFromClassName(managerClass);
                    manager.loadConsoleUIForSession(context.v, this.session);
                } catch (e) {
                    logger.error(e.message ? e.message : e);
                    this.outputError(e.message ? e.message : e);
                    return;
                }
            });
        } catch (e) {
            logger.error(e.message ? e.message : e);
            this.outputError(e.message ? e.message : e);
        }
    }

    outputError(msg) {
        this.cli.outputStream.write(`${chalk.styles.red.open}${msg}${chalk.styles.red.close}\n`);
        this.cli.displayPrompt();
    }

    outputSuccess(msg) {
        this.cli.outputStream.write(`${chalk.styles.green.open}${msg}${chalk.styles.green.close}\n`);
        this.cli.displayPrompt();
    }

    outputWarning(msg) {
        this.cli.outputStream.write(`${chalk.styles.yellow.open}${msg}${chalk.styles.yellow.close}\n`);
        this.cli.displayPrompt();
    }
}


export default Console;