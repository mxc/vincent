/**
 * Created by mark on 2016/07/30.
 */
import AnsibleEngineComponent from '../../../engines/AnsibleEngineComponent';
import AptRepositoryManager from '../AptRepositoryManager';
import YumRepositoryManager from '../YumRepositoryManager';

class AnsibleEngine extends AnsibleEngineComponent{
    constructor(provider) {
        super(provider);
        this.provider = provider;
    }


    exportToEngine(host,tasks){
        let repository;

        try {
            repository = host.getConfig("repository");
        }catch(e){
            return;
        }

        if(repository.packages.length==0){
            return;
        }

        if(repository instanceof AptRepositoryManager){
            if(host.osFamily.toLowerCase()==="debian"){
               repository.packages.forEach((pckage)=>{
                   let t = { name: `configs[repository] - Installed software check for ${pckage.name}`,
                            apt: `state=${pckage.state} name=${pckage.name} update_cache=${repository.updateCache}`};
                            //apt: `state=${pckage.state} name=${pckage.name} update_cache=${repository.updateCache} cache_valid_time:${repository.cacheValidTime}`};
                   this.appendBecomes(host,repository,t);
                   tasks.push(t);
               });
            }
        }else if (repository instanceof YumRepositoryManager){
            if (host.osFamily.toLowerCase()=="redhat") {
                repository.packages.forEach((pckage)=>{
                    let t = {name: `configs[repository] - Installed software check for ${pckage.name}`,
                             yum: `update_cache=${repository.updateCache}  state=${pckage.state} name=${pckage.name}`};
                    this.appendBecomes(host,repository,t);
                    tasks.push(t);
                });
            }
        }
    }

}

export default AnsibleEngine;