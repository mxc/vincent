/**
 * Created by mark on 2016/05/08.
 */


import Vincent from '../Vincent';

const _appUser = Symbol("appUser");
const _manager = Symbol("manager");
const _provider = Symbol("provider");

class PermissionsUIManager  {

    constructor(appUser,manager){
        this[_appUser]=appUser;
        this[_manager]=manager;
        this[_provider] = Vincent.app.provider;
    }

    get owner(){
        return this[_provider]._readAttributeCheck(this[_appUser], this[_manager], ()=> {
            return this[_manager].owner;
        });
    }

    get group(){
        return this[_provider]._readAttributeCheck(this[_appUser], this[_manager], ()=> {
            return this[_manager].group;
        });
    }

    get permissions(){
        return this[_provider]._readAttributeCheck(this[_appUser], this[_manager], ()=> {
            return this[_manager].permissions;
        });
    }

    set owner(owner) {
        tthis[_provider]._writeAttributeCheck(this[_appUser], this[_manager], ()=> {
            this[_manager].owner = owner;
        });
    }

    set group(group) {
        this[_provider]._writeAttributeCheck(this[_appUser], this[_manager], ()=> {
            this[_manager].group = group;
        });
    }

    set permissions(permissions) {
        this[_provider]._writeAttributeCheck(this[_appUser], this[_manager], ()=> {
            this[_manager].permissions = permissions;
        });
    }

}

export default PermissionsUIManager;