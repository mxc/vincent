/**
 * Created by mark on 4/2/16.
 */

class EngineComponent {

    exportToEngine(host,tasks) {
        throw new Error ("Method must be overridden in child object");
    }

}

export default EngineComponent;