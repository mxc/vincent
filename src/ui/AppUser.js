/**
 * Created by mark on 2016/04/27.
 */

    import logger from '../Logger'; 

class AppUser {

    constructor(name,groups,primaryGroup) {

        if (!name || typeof name !== "string") {
            logger.logAndThrow("The parameter name is mandatory and must be a username string");
        }

        //if no user groups are defined place user in own group
        if (!groups){
            groups = [name];
        }
        
        this.name = name;

        this.groups = groups;
        if (groups.indexOf("root") != -1 ||
            groups.indexOf("vadmin") != -1) {
            this.isAdmin = true;
        }else{
            this.isAdmin= false;
        }
        //set primary group is defined or default if not defined
        this.primaryGroup = primaryGroup? primaryGroup: groups[0];
        if (this.groups.indexOf(this.primaryGroup)==-1){
                this.groups.push(this.primaryGroup);
        }
        this.groups = Object.freeze(this.groups);
        return Object.freeze(this);
    }

}

export default AppUser;