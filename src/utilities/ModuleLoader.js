/**
 * Created by mark on 2016/03/26.
 */

import {System} from 'es6-module-loader';
import UserManager from  './../modules/user/UserManager';
import GroupManager from  './../modules/group/GroupManager';
import HostManager from './../modules/host/HostManager'
import SudoManager from './../modules/sudo/SudoManager'
import UserAnsibleEngine from './../modules/user/engine/AnsibleEngine';
import GroupAnsibleEngine from './../modules/group/engine/AnsibleEngine';
import SshAnsibleEngine from './../modules/ssh/engine/AnsibleEngine';
import SudoAnsibleEngine from './../modules/sudo/engine/AnsibleEngine';
import SSHManager from './../modules/ssh/SshManager';
import logger from './../Logger';

class ModuleLoader {

    static init() {
        if (!ModuleLoader.initialised) {
            System.paths['babel'] = 'node_modules/babel-cli/bin/babel.js';
            System.transpiler = 'babel';
            ModuleLoader.initialised = true;
        }
    }

    /** mocked for now **/
    static loadEngines(dir, provider) {
        let name = dir;
        let engines = {};
        if (name === 'user') {
            engines['ansible'] = new UserAnsibleEngine(provider);
        } else if (name === 'group') {
            engines['ansible'] = new GroupAnsibleEngine(provider);
        } else if (name === 'ssh') {
            engines['ansible'] = new SshAnsibleEngine(provider);
        } else if (name === 'sudo') {
            engines['ansible'] = new SudoAnsibleEngine(provider);
        }
        return engines;
    }

    /*
     Currently node does not support es2015 module loading. All the polyfills tried fail to work with transpiling
     */

    static parseDirectory(dir, match, provider) {

        return new Promise(resolve => {
            ModuleLoader.modules.push(UserManager);
            ModuleLoader.modules.push(GroupManager);
            ModuleLoader.modules.push(HostManager);
            ModuleLoader.modules.push(SSHManager);
            ModuleLoader.modules.push(SudoManager);

            let loaded={};
            ModuleLoader.modules.forEach((manager)=> {
                if (typeof manager != 'function'){
                    logger.logAndThrow(`${manager.name} getDependencies method should return an array of constructors`);
                }
                this.callFunctionInManagerDependencyOrder(manager, provider, loaded, (manager)=> {
                    let name = manager.name.charAt(0).toLowerCase() + manager.name.slice(1);
                    provider.managers[name] = new manager(provider);
                });
            });

            //provider.managers.userManager = new UserManager(provider);
            //provider.managers.groupManager = new GroupManager(provider);
            //provider.managers.hostManager = new HostManager(provider);
            //provider.managers.sshManager = new SSHManager(provider);
            //provider.managers.sudoManager = new SudoManager(provider);
            resolve();
        });

        // ModuleLoader.init();
        // let promise = new Promise(resolve => {
        //     let promises = [];
        //     fs.readdir(dir, (err, files)=> {
        //         if (!files) {
        //             console.log(dir);
        //             console.log("no files");
        //             resolve();
        //             return;
        //         }
        //         files.forEach(file=> {
        //             let fullpath = path.resolve(dir, file);
        //             let stats = fs.statSync(fullpath);
        //             if (stats && stats.isDirectory()) {
        //                 Array.prototype.push.apply(promises, ModuleLoader.parseDirectory(fullpath, match, dictionary));
        //             } else if (stats && stats.isFile()) {
        //                 if (file.endsWith(`${match}.js`)) {
        //                     console.log("Match!");
        //                     promises.push(new Promise(innerResolve=> {
        //                         System.import(fullpath).then(mod => {
        //                             console.log(fullpath);
        //                             let key = file.substring(0, file.indexOf(match));
        //                             console.log(key);
        //                             dictionary[key] = new mod.default();
        //                             innerResolve();
        //                         }).catch(e=> {
        //                             console.log(e);
        //                         });
        //                     }).catch(e=>{console.log(e)}));
        //                 }
        //             }
        //         });
        //         Promise.all(promises).then(resolve);
        //     });
        // });
        // return promise;
    }

    //static upperCaseFirstLetter(string) {
    //    return string.charAt(0).toUpperCase() + string.slice(1);
    //}

    static callFunctionInManagerDependencyOrder(managerClass, provider,loaded, callback) {
            if(typeof managerClass !="function"){
                logger.logAndThrow("The managerClass parameter must be a class constructor function");
            }

            //have we already loaded this manager?
            if (loaded[managerClass.name]) {
                return;
            }

            try {
                var list = managerClass.getDependencies();
            }catch(e){
                logger.logAndThrow(`Error loading managers and dependencies - ${e}`);
            }

            let missingDependencies = false;
            list.forEach((clazz)=> {
                if (!provider.managers[clazz.name]) {
                    //console.log(`loading dependency ${clazz.name}`)
                    try {
                        this.callFunctionInManagerDependencyOrder(clazz, provider, loaded, callback);
                    } catch (e) {
                        missingDependencies = true;
                        throw (e);
                    }
                }
            });
            if (!missingDependencies) {
                try {
                    callback(managerClass);
                    loaded[managerClass.name] = true;
                } catch (e) {
                    missingDependencies = true;
                    logger.logAndThrow(`Error loading manager dependencies - ${e}`);
                }
            }
            return loaded;
    }


}

ModuleLoader.modules =[];
ModuleLoader.initialised = false;

export default ModuleLoader;