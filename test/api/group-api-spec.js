/**
 * Created by mark on 2016/05/29.
 */
import Provider from './../../src/Provider';
import {expect} from 'chai';
import UserAccount from '../../src/modules/user/UserAccount';
import Host from '../../src/modules/host/Host';
import User from '../../src/modules/user/User';
import Group from '../../src/modules/group/Group';
import HostGroup from '../../src/modules/group/HostGroup';
import HostSudoEntry from '../../src/modules/sudo/HostSudoEntry';

describe("Group API should", function () {

    it("allow groups to be constructor from group name", function () {
        expect(()=>{
            let group = new Group("groupx");
        }).to.not.throw();
    });

    it("allow groups to be constructor from group data structure", function () {
        let data = {
            name: "groupx",
            gid:1000,
            state:"present"
        };
        expect(()=>{
            let group = new Group(data);
        }).to.not.throw();
    });

});