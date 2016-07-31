/**
 * Created by mark on 2016/07/30.
 */


import HostComponent from '../../base/HostComponent';
import base from '../../base/Base';
import {logger} from '../../../Logger';
import Package from './Package';

class RepositoryManager  extends HostComponent{
    
    constructor(provider,data){
        super(provider,data);
        this.data.packages = [];
        if(data){
            this.data.updateCache=data.updateCache? data.updateCache: true;
            if(data.packages) {
                data.packages.forEach((pack)=> {
                    this.data.packages.push(new Package(pack.name, pack.state));
                });

            }
        }else {
            this.data.updateCache = true;
            this.data.packages = [];
        }
    }

    get updateCache(){
        return this.data.updateCache;
    }

    set updateCache(cache){
        this.data.updateCache=base.getBooleanValue(cache);
    }
    
    addRepository(){
        throw new Error("Not yet implemented");
    }

    install(repopackage){
        this.data.packages.push(new Package(repopackage,"present"));
    }

    remove(repopackage){
        let idx = this.data.packages.indexOf(repopackage);
        if(idx!=-1){
            this.data.packages[idx].state="absent";
        }else{
            this.data.packages.push(new Package(repopackage,"absent"));
        }
    }

    purge(repopackage){
        let idx = this.data.packages.indexOf(repopackage);
        if(idx!=-1){
            this.data.packages[idx].state="purge";
        }else{
            this.data.packages.push(new Package(repopackage,"purge"));
        }
    }

    doNotUpdate(repopackage){
        let idx = this.data.packages.indexOf(repopackage);
        if(idx!=-1){
            this.data.packages[idx].state="hold";
        }else{
            this.data.packages.push(new Package(repopackage,"hold"));
        }
    }

    get packages(){
        return this.data.packages;
    }

    export(){
        let obj={};
        obj.updateCache=this.data.updateCache;
        obj.packages=[];
        this.packages.forEach((repopackage)=>{
            obj.packages.push(repopackage.export());
        });
        return obj;
    }
}

export default RepositoryManager;