/**
 * Created by mark on 2016/03/26.
 */

import {System} from 'es6-module-loader';
import UserManager from  './../modules/user/UserManager';
import GroupManager from  './../modules/group/GroupManager';



class ModuleLoader {

    static init() {
        if (!ModuleLoader.initialised) {
            System.paths['babel'] = 'node_modules/babel-cli/bin/babel.js';
            System.transpiler = 'babel';
            ModuleLoader.initialised = true;
        }
    }

    /*
    Currently node does not support es2015 module loading. All the polyfills tried fail to work with transpiling
     */

    static parseDirectory(dir, match, provider) {
        let promise = new Promise(resolve =>{
            provider.managers['users'] = new UserManager(provider);
            provider.managers['groupManager'] = new GroupManager(provider);
            resolve();
        });
        return promise;
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

}

ModuleLoader.initialised = false;

export default ModuleLoader;