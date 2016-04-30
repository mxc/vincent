/**
 * Created by mark on 2016/04/27.
 */


class AppUser {

    constructor(name, groups) {
        this.name = name;
        this.groups = groups;
        if (groups.indexOf("root") != -1 ||
            groups.indexOf("vadmin") != -1) {
            this.isAdmin = true;
        }else{
            this.isAdmin= false;
        }
    }

}

export default AppUser;