/**
 * Created by mark on 2016/03/26.
 */

import fs from 'fs';
import path from 'path';
import System from 'systemjs';

class ModuleLoader {

    static parseDirectory(dir, match, dictionary) {

        let promise = new Promise(resolve => {
            let promises = [];
            fs.readdir(dir, (err, files)=> {
                if (!files) {
                    console.log(dir);
                    console.log("no files");
                    resolve();
                    return;
                }
                files.forEach(file=> {
                    let fullpath = path.resolve(dir, file);
                    fs.stat(fullpath, (err, stats)=> {
                        if (stats && stats.isDirectory()) {
                            Array.prototype.push.apply(promises, ModuleLoader.parseDirectory(fullpath, match, dictionary));
                        } else if (stats && stats.isFile()) {
                            if (file.endsWith(`${match}.js`)) {
                                console.log("Match!");
                                promises.push(new Promise(resolve=> {
                                    System.import(fullpath).then(mod => {
                                        console.log(fullpath);
                                        let key = file.substring(0, file.indexOf(match));
                                        console.log(key);
                                        dictionary[key] = new mod.default();
                                        resolve();
                                    }).catch(e=> {
                                        console.log(e);
                                    });
                                }));
                            }
                        }
                    });
                });
            });
            Promise.all(promises).then(resolve);
        });
        return promise;
    }

}

export default ModuleLoader;