/**
 * Created by mark on 2016/07/16.
 */


import {expect} from 'chai';
import ModuleLoader from '../../src/utilities/ModuleLoader';


describe("Modue Loader utility ", ()=> {
    "use strict";

    function Root(){}

    Root.getDependencies=function(){
        return [];
    };

    function Root2(){};
    Root2.getDependencies=function(){
        return [];
    }

    function Child1(){}
    Child1.getDependencies=function(){
        return [Root];
    };

    function Child2(){}
    Child2.getDependencies=function(){
        return [Root,Child1];
    }

    function Child3(){};
    Child3.getDependencies=function(){
        return [Child1,Child2];
    }

    function Child4(){};
    Child4.getDependencies=function(){
        return [Child3];
    }

    function Root3(){};
    Root3.getDependencies=function(){
        return [];
    }

    function Childa(){};
    Childa.getDependencies=function(){
        return [ Root3,Childb];
    }

    function Childb(){};
    Childb.getDependencies=function(){
        return [ Childc];
    }

    function Childc(){};
    Childc.getDependencies=function(){
        return [ Childa];
    }

    it("should create a proper dependency graph from in order parent & child", ()=> {
            let loader = new ModuleLoader({});
            loader.parseModulesDirectory([Root,Child1]);
            expect(loader.graph.roots.size).equals(1);
            let parent = loader.graph.roots.values().next().value;
            expect(parent.name).equals("Root");
            expect(parent.decendents.size).equals(1);
            expect(parent.ancestors.size).equals(0);
            let child = parent.decendents.values().next().value;
            expect(child.name).equals("Child1");
            expect(child.ancestors.size).equals(1);
            expect(child.decendents.size).equals(0);
    });

    it("should create a proper dependency graph from out of order parent & child", ()=> {
        let loader = new ModuleLoader({});
        loader.parseModulesDirectory([Child1,Root]);
        expect(loader.graph.roots.size).equals(1);
        let parent = loader.graph.roots.values().next().value;
        expect(parent.name).equals("Root");
        expect(parent.decendents.size).equals(1);
        expect(parent.ancestors.size).equals(0);
        let child = parent.decendents.values().next().value;
        expect(child.name).equals("Child1");
        expect(child.ancestors.size).equals(1);
        expect(child.decendents.size).equals(0);
    });

    it("should create a proper depencency graph for mutiple roots, and multiple levels of children",()=>{
        let loader = new ModuleLoader({});

        loader.parseModulesDirectory([Child2,Child4,Root2,Root,Child1]);
        expect(loader.graph.roots.size).equals(2);
        let parent = loader.graph.roots.values().next().value;
        expect(parent.name).equals("Root");
        expect(parent.decendents.size).to.equal(2);
        expect(parent.ancestors.size).equals(0);

        let children = parent.decendents.values();
        let child = children.next().value;
        expect(child.name).equals("Child2");
        expect(child.ancestors.size).equals(2);
        expect(child.decendents.size).equals(1);


        child = children.next().value;
        expect(child.name).equals("Child1");

        let grandchildren = child.decendents.values();
        let gchild = grandchildren.next().value;
        expect(gchild.name).equals("Child2");
        gchild = grandchildren.next().value;
        expect(gchild.name).equals("Child3");

        let greatgrandchildren = gchild.decendents.values();
        let ggchild = greatgrandchildren.next().value;
        expect(ggchild.getDependencySet().size).equals(4);

        let roots = loader.graph.roots.values();
        roots.next();
        parent = roots.next().value;
        expect(parent.name).equals("Root2");
        expect(parent.decendents.size).to.equal(0);

    });

    it("should throw an error if the list of modules are not an array",()=>{
        let loader = new ModuleLoader({});
        expect(()=>{ loader.parseModulesDirectory("Child1,Root"); }).to.throw("Parameter modules should be of type array");
    });

    it("should detect circular references",()=>{
        let loader = new ModuleLoader({});
        expect(()=>{ loader.parseModulesDirectory([Root3,Childa,Childb,Childc]); }).to.throw("Circular dependency between Childb and Childa");
    });

});