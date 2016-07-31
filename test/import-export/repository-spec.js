/**
 * Created by mark on 2016/07/31.
 */
import Provider from './../../src/Provider';
import {expect} from 'chai';
import Host from '../../src/modules/host/Host';
import base from '../../src/modules/base/Base';
import RepositoryManagerManager from '../../src/modules/applications/repository/RepositoryManagerManager';
import AptRepositoryManager from '../../src/modules/applications/repository/AptRepositoryManager';


describe("Repository API should", function () {

    it("properly export repository object for persistence",()=>{
        let provider = new Provider();
        let repositoryManagerManager = new RepositoryManagerManager(provider);
        let host = new Host(provider,"www.linux.joburg","einstein","dev","770","default","Debian");
        provider.managers.hostManager.addHost(host);
        let repo = repositoryManagerManager.addRepositoryManagerToHost(host);
        repo.install("apache2");
        repo.remove("mysql");
        repo.purge("nginx");
        repo.install("ssh");
        expect(repo.export()).to.deep.equal({
            updateCache: true,
            packages:
                [ { name: 'apache2', state: 'present' },
                    { name: 'mysql', state: 'absent' },
                    { name: 'nginx', state: 'purge' },
                    { name: 'ssh', state: 'present' } ]
        });
    });


    it("properly import a repository json object",()=>{
        let json = {
            configs: {
                repository: {
                    updateCache: true,
                    packages: [{name: 'apache2', state: 'present'},
                        {name: 'mysql', state: 'absent'},
                        {name: 'nginx', state: 'purge'},
                        {name: 'ssh', state: 'present'}]
                }
            }
        };
        let provider = new Provider();
        let repositoryManagerManager = new RepositoryManagerManager(provider);
        let host = new Host(provider,"www.linux.joburg","einstein","dev","770","default","Debian");
        provider.managers.hostManager.addHost(host);
        let terrors={};
        terrors[host.name]=new Map();
        let repo = repositoryManagerManager.loadHost({
            errors:terrors
        },host,json);
        expect(host.getConfig('repository')).isDefined;
    });
});