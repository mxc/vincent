/**
 * Created by mark on 2016/07/15.
 */

class DependencyVertex {

    constructor(clazz) {
        this.clazz = clazz;
        this.name = clazz.name;
        this.ancestors = new Set();
        this.decendents = new Set();
    }

 
     getDependencySet() {
        let set = new Set(this.ancestors);
        let arr = Array.from(this.ancestors.values());
        arr.forEach((v)=>{
            let tset = v.getDependencySet();
            let tarr = Array.from(tset.values());
            tarr.forEach((tv)=>{
                set.add(tv);
            });
        });
        return set;
    }
    
    hasAncestor(vertex){
        let arr = Array.from(this.getDependencySet());
        return arr.find((v)=>{
            return v.name === vertex.name;
        });
    }

}


export default DependencyVertex;