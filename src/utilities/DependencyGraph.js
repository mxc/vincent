/**
 * Created by mark on 2016/07/15.
 */

class DependencyGraph {

    constructor() {
        this.vertices = new Set();
        this.roots =new Set();
    }

    getVertex(clazz){
        let arr = Array.from(this.vertices.values());
        return arr.find((vertex)=>{
            if (vertex.name==clazz.name){
                return true;
            }
        });
    }
    
    
}


export default DependencyGraph;