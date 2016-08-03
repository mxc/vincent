/**
 * Created by mark on 2016/07/25.
 */


var data = new WeakMap();

class RemoteAccess {
    
    constructor(remoteAccess){
        data.set(this,remoteAccess);
    }

    get sudoAuthentication() {
        return data.get(this).sudoAuthentication;
    }

    set sudoAuthentication(enable) {
        data.get(this).sudoAuthentication=enable;
    }

    get remoteUser() {
        return data.get(this).remoteUser;
    }

    get becomeUser() {
        return data.get(this).becomeUser;
    }

    get authentication() {
        return data.get(this).authentication;
    }

    set remoteUser(remoteUser) {
            data.get(this).remoteUser = remoteUser.name? remoteUser.name:remoteUser;
    }

    set authentication(authentication) {
        data.get(this).authentication = authentication;
    }

    set becomeUser(becomeUser) {
        data.get(this).becomeUser=becomeUser;
    }

    inspect(){
        return {
            remoteUser: data.get(this).remoteUser,
            authentication: data.get(this).authentication,
            becomeuser: data.get(this).becomeUser?data.get(this).becomeUser:"root",
            sudoAuthentication: data.get(this).sudoAuthentication
        }
    }
}

export default RemoteAccess;