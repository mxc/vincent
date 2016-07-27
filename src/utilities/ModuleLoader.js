/**
 * Created by mark on 2016/03/26.
 */

import {System} from 'es6-module-loader';
import UserManager from  './../modules/user/UserManager';
import GroupManager from  './../modules/group/GroupManager';
import SystemUpdateManager from  './../modules/applications/systemupdate/SystemUpdateManager';
import HostManager from './../modules/host/HostManager'
import SudoManager from './../modules/sudo/SudoManager'
import UserAnsibleEngine from './../modules/user/engine/AnsibleEngine';
import GroupAnsibleEngine from './../modules/group/engine/AnsibleEngine';
import SshAnsibleEngine from './../modules/ssh/engine/AnsibleEngine';
import SudoAnsibleEngine from './../modules/sudo/engine/AnsibleEngine';
import SysUpdateAnsibleEngine from '../modules/applications/systemupdate/engine/AnsibleEngine';
import SshManager from './../modules/ssh/SshManager';
import {logger} from './../Logger';
import DependencyGraph from './DependencyGraph';
import DependencyVertex from './DependencyVertex';


class ModuleLoader {

    constructor(provider) {
        this.graph = new DependencyGraph();
        this.initialised = false;
        this.provider = provider;
        this.init();
    }

    init() {
        if (!this.initialised) {
            System.paths['babel'] = 'node_modules/babel-cli/bin/babel.js';
            System.transpiler = 'babel';
            this.initialised = true;
        }
    }

    /** mocked for now **/
    loadEngines(dir, provider) {
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
        }else if(name==='sysUpdate'){
            engines['ansible'] = new SysUpdateAnsibleEngine(provider);
        }
        return engines;
    }

    parseModulesDirectory(modules) {
        if(!modules) {
            modules = [];
            modules.push(UserManager);
            modules.push(GroupManager);
            modules.push(HostManager);
            modules.push(SshManager);
            modules.push(SudoManager);
            modules.push(SystemUpdateManager);
        }else{
            if(!Array.isArray(modules)){
                    logger.logAndThrow("Parameter modules should be of type array");                
            }
        }
        while (modules.length > 0) {
            this.buildDependencyGraph(modules, modules[0]);
        }
    }

    /*
     Currently node does not support es2015 module loading. All the polyfills tried fail to work with transpiling
     */

    buildDependencyGraph(modules, current, childVertex) {
        if(typeof current !=="function"){
            logger.logAndThrow("Parameter current should be a Class definition");
        }
        try {

            let index = modules.indexOf(current);
            if(index!=-1) {
                modules.splice(modules.indexOf(current), 1);
            }

            let vertex = this.graph.getVertex(current);
            let found = true;

            if (!vertex) {
                vertex = new DependencyVertex(current);
                this.graph.vertices.add(vertex);
                found=false;
            }

            if(!found) {
                var list = current.getDependencies();
                list.forEach((clazz)=> {
                    vertex.ancestors.add(this.buildDependencyGraph(modules, clazz, vertex));
                    //remove the root elements
                    if (this.graph.roots.has(vertex)) {
                        this.graph.roots.delete(vertex);
                    }
                });
            }
            //check for ciruclar dependencies
            if (childVertex) {
                if(vertex.hasAncestor(childVertex)){
                    logger.logAndThrow(`Circular dependency between ${vertex.name} and ${childVertex.name}`);
                }
                vertex.decendents.add(childVertex);
            }
            //add the vertex to graph root if it has no incoming elements
            if(vertex.ancestors.size==0){
                this.graph.roots.add(vertex);
            }
            return vertex;
        } catch (e) {
            logger.logAndThrow(`Fatal error loading module manager - ${e.message ? e.message : e}`);
          }
    }

    callFunctionInTopDownOrder(callback, vertex, loaded) {

        if(!vertex){
            vertex = this.graph.roots.values().next().value;
        }

        if(!loaded){
            loaded={};
        }

        if (typeof vertex.clazz != "function") {
            logger.logAndThrow("The managerClass parameter must be a class constructor function");
        }

        //have we already loaded this manager?
        if (loaded[vertex.name]) {
            return;
        }

        try {
            callback(vertex.clazz);
            loaded[vertex.name] = true;
        } catch (e) {
            logger.logAndThrow(`${vertex.name} threw an error on callback - ${e.message? e.message:e}`);
        }

        Array.from(vertex.decendents.values()).forEach((v)=> {
                    this.callFunctionInTopDownOrder(callback,v,loaded);
        });

    }

    callFunctionInBottomUpOrder(callback, vertex, loaded) {
        if(!vertex){
            vertex = this.graph.roots.values().next().value;
        }

        if(!loaded){
            loaded={};
        }

        if (typeof vertex.clazz != "function") {
            logger.logAndThrow("The managerClass parameter must be a class constructor function");
        }

        //have we already loaded this manager?
        if (loaded[vertex.name]) {
            return;
        }

        Array.from(vertex.decendents.values()).forEach((v)=> {
            this.callFunctionInBottomUpOrder(callback,v,loaded);
        });

        try {
            callback(vertex.clazz);
            loaded[vertex.name] = true;
        } catch (e) {
            logger.logAndThrow(`${vertex.name} threw an error on callback - ${e.message? e.message:e}`);
        }

    }

}


export default ModuleLoader;