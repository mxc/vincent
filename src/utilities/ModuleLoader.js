/**
 * Created by mark on 2016/03/26.
 */

import {System} from 'es6-module-loader';
import UserManager from  './../modules/user/UserManager';
import UserCategories from  './../modules/user/UserCategories';
import GroupManager from  './../modules/group/GroupManager';
import GroupCategories from  './../modules/group/GroupCategories';
import HostManager from './../modules/host/HostManager'
import SudoManager from './../modules/sudo/SudoManager'
import UserAnsibleEngine from './../modules/user/engine/AnsibleEngine';
import GroupAnsibleEngine from './../modules/group/engine/AnsibleEngine';
import SshAnsibleEngine from './../modules/ssh/engine/AnsibleEngine';
import SudoAnsibleEngine from './../modules/sudo/engine/AnsibleEngine';
import SshManager from './../modules/ssh/SshManager';
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
            ModuleLoader.modules.push(UserCategories);
            ModuleLoader.modules.push(GroupManager);
            ModuleLoader.modules.push(GroupCategories);
            ModuleLoader.modules.push(HostManager);
            ModuleLoader.modules.push(SshManager);
            ModuleLoader.modules.push(SudoManager);
            ModuleLoader.managerOrderedIterator((manager)=> {
                let name = manager.name.charAt(0).toLowerCase() + manager.name.slice(1);
                provider.managers[name] = new manager(provider);
            }, provider);


            //provider.managers.userManager = new UserManager(provider);
            //provider.managers.groupManager = new GroupManager(provider);
            //provider.managers.hostManager = new HostManager(provider);
            //provider.managers.sshManager = new SshManager(provider);
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

    static managerOrderedIterator(callback, provider) {
        let loaded = {};
        ModuleLoader.modules.forEach((managerClass)=> {
            try {
                ModuleLoader.callFunctionInManagerDependencyOrder(managerClass, provider, loaded, callback);
                //call HostManager last as it will be dependent on many modules
                callback(HostManager);
            } catch (e) {
                logger.fatal(`Fatal error loading module manager -${e.message? e.message:e}`);
                console.log(e);
                process.exit(1);
            }
        });
    }

    static callFunctionInManagerDependencyOrder(managerClass, provider, loaded, callback) {
        //we load HostManager last as it is dependent on every other module.
        if (managerClass.name ==='HostManager') return;

        if (typeof managerClass != "function") {
            logger.logAndThrow("The managerClass parameter must be a class constructor function");
        }
        //have we already loaded this manager?
        if (loaded[managerClass.name]) {
            return;
        }

        try {
            var list = managerClass.getDependencies();
        } catch (e) {
            logger.logAndThrow(`Error loading managers and dependencies - ${e.message? e.message:e}`);
        }

        let missingDependencies = false;
        list.forEach((clazz)=> {
            if (!provider.managers[clazz.name]) {
                try {
                    this.callFunctionInManagerDependencyOrder(clazz, provider, loaded, callback);
                } catch (e) {
                    logger.error(`${managerClass.name} has a missing dependency`)
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
                logger.logAndThrow(`Error loading manager dependencies for ${managerClass.name} - ${e}`);
            }
        }
        return loaded;
    }
}

ModuleLoader.modules = [];
ModuleLoader.initialised = false;

export default ModuleLoader;