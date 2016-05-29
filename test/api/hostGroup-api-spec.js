/**
 * Created by mark on 2016/05/29.
 */
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

describe("HostGroup API should", function () {
    var validUsers = [
        new User({name: 'user1', key: 'user1.pub', state: 'present'}),
        new User({name: 'user2', key: undefined, state: 'absent'}),
        new User({name: 'user3', key: 'user3.pub', uid: 1000, state: 'present'}),
        new User({name: 'user4', key: undefined, state: 'present', uid: undefined})
    ];

    var validGroups = [
        new Group({
            name: 'group1',
            gid: undefined,
            state: 'present'
        }),
        new Group({
            name: 'group2',
            gid: undefined,
            state: 'present'
        }),
        new Group({
            name: 'group3',
            gid: 1000,
            state: 'present'
        })
    ];

    let provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;

    it("allow HostGroups to be constructed from data structure", function () {
        let hostGroup = new HostGroup(provider, {
            group: {
                name: 'group2',
            },
                members: [
                    "user1",
                    "user2"]
        });
        expect((hostGroup)).to.not.be.undefined;
        //absent users are not added to host groups
        expect(hostGroup.members.length).to.equal(1);
    });

    it("allow members to be added to groups after construction", function () {
        let hostGroup = new HostGroup(provider, {
            group: {
                name: 'group2'
            },
                members: [
                    "user1"]
        });
        expect(hostGroup.members.length).to.equal(1);
        hostGroup.addMember("user3");
        expect(hostGroup.members.length).to.equal(2);
    });

    it("allow members to be removed from a group after construction", function () {
        let hostGroup = new HostGroup(provider, {
            group: {
                name: 'group2'
            },
            members: [
                "user1"]
        });
        expect(hostGroup.members.length).to.equal(1);
        hostGroup.removeMember("user1");
        expect(hostGroup.members.length).to.equal(0);
    });

});