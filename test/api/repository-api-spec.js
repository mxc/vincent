/**
 * Created by mark on 2016/07/31.
 */
import Provider from './../../src/Provider';
import {expect} from 'chai';
import Host from '../../src/modules/host/Host';
import RepositoryManagerManager from '../../src/modules/applications/repository/RepositoryManagerManager';
import AptRepositoryManager from '../../src/modules/applications/repository/AptRepositoryManager';


describe("Repository API should", function () {


    it("create correct repository for osFamily",()=>{
        let provider = new Provider();
        let repositoryManagerManager = new RepositoryManagerManager(provider);
        let host = new Host(provider,"www.linux.joburg","einstein","dev","770","default","Debian");
        provider.managers.hostManager.addHost(host);
        let repo = repositoryManagerManager.addRepositoryManagerToHost(host);
        expect(repo.packages.length).to.equal(0);
        expect(host.getConfig("repository")).isDefined;
    });

    it("allow packages to be added, removed, put on hold or purged",()=>{

        let provider = new Provider();
        let repositoryManagerManager = new RepositoryManagerManager(provider);
        let host = new Host(provider,"www.linux.joburg","einstein","dev","770","default","Debian");
        provider.managers.hostManager.addHost(host);
        let repo = repositoryManagerManager.addRepositoryManagerToHost(host);
        repo.install("apache2");
        repo.remove("mysql");
        repo.purge("nginx");
        repo.install("ssh");
        expect(repo.packages.length).to.equal(4);
        expect(repo.packages[0].state).to.equal("present");
    });




});