/**
 * Created by mark on 2016/07/29.
 */
import Provider from './../../src/Provider';
import {expect} from 'chai';
import Host from '../../src/modules/host/Host';
import User from '../../src/modules/user/User';
import Group from "../../src/modules/group/Group";
import History from '../../src/modules/host/History';


describe("History API should", function () {
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

    var host = {
        name: "192.168.122.21",
        owner: "einstein",
        group: "sysadmin",
        permissions: 770,
        configGroup: "default",
        osFamily: "Debian",
        users: [
            {
                user: {name: "user1", state: "present"}
            },
            {
                user: {name: "user2", state: "absent"}
            }
        ],
        groups: [
            {
                group: {name: "group1", state: "present"},
                members: [
                    "user1"
                ]
            },
            {
                group: {name: "group2", state: "present"}
            },
            {
                group: {name: "group3", state: "present"},
                members: [
                    "user1"
                ]
            }

        ]
    };

    let provider = new Provider();
    //inject mocks
    provider.managers.groupManager.validGroups = validGroups;
    provider.managers.userManager.validUsers = validUsers;
    let rhost = provider.managers.hostManager.loadFromJson(host);

    it("allow data entries to be added to history", function () {
        let entry1 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                    failed: true,
                                    msg: "Failed to lock apt for exclusive operation"
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 1,
                    ok: 2,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };
        let provider = new Provider();
        let history = new History(provider.engine,"192.168.122.21");
        let entry = history.addEntry(Date.now(),entry1);
        expect(entry.status).to.equal("failed");
        expect(entry.errors.length).to.equal(1);
        expect(entry.errors[0].task).to.equal("Perform system update");
        expect(entry.errors[0].msg).to.equal("Failed to lock apt for exclusive operation");
    });

    it("not allow data entries to be created if the host and entry details do not match", function () {
        let entry1 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                    failed: true,
                                    msg: "Failed to lock apt for exclusive operation"
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 1,
                    ok: 2,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };
        let provider = new Provider();
        let history = new History(provider.engine,"www.example.co.za");
        expect(()=>{ history.addEntry(Date.now(),entry1); }).to.throw("Cannot create an entry for 192.168.122.21 for www.example.co.za.");
    });


    it("allow multiple data entries to be created if the host and entry details match", function () {
        let entry1 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                    failed: true,
                                    msg: "Failed to lock apt for exclusive operation"
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 1,
                    ok: 2,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };

        let entry2 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 0,
                    ok: 3,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };

        let provider = new Provider();
        let history = new History(provider.engine,"192.168.122.21");
        let date1 = Date.parse("2016-08-21");
        let date2 = Date.parse("2016-09-14");
        history.addEntry(date1,entry1);
        history.addEntry(date2,entry2);
        expect(history.listEntries.length).to.equal(2);
    });



    it("allow entries to be deleted.", function () {
        let entry1 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                    failed: true,
                                    msg: "Failed to lock apt for exclusive operation"
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 1,
                    ok: 2,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };

        let entry2 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 0,
                    ok: 3,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };


        let provider = new Provider();
        let history = new History(provider.engine,"192.168.122.21");
        let date1 = Date.parse("2016-08-21");
        let date2 = Date.parse("2016-09-14");
        history.addEntry(date1, entry1);
        history.addEntry(date2, entry2);
        expect(history.listEntries.length).to.equal(2);
        let timestamp = history.listEntries[1].date;
        history.deleteEntry(timestamp);
        console.log(history.listEntries);
        expect(history.getEntry("2016-09-14").status).to.equal("passed");
    });

    it("return date range searches correctly.", function () {
        let entry1 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                    failed: true,
                                    msg: "Failed to lock apt for exclusive operation"
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 1,
                    ok: 2,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };

        let entry2 = {
            plays: [
                {
                    play: {
                        id: "3a4757e7-e300-4b2a-aef5-1f314b073764",
                        name: "192.168.122.21"
                    },
                    tasks: [
                        {
                            hosts: {
                                "192.168.122.21": {
                                    ansible_virtualization_type: "kvm",
                                    module_setup: true
                                },
                                changed: false,
                                invocation: {
                                    module_args: {
                                        fact_path: "/etc/ansible/facts.d",
                                        filter: "*",
                                        gather_subset: [
                                            "all"
                                        ]
                                    },
                                    module_name: "setup"
                                }
                            },
                            task: {
                                id: "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                name: ""
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    append: false,
                                    changed: false,
                                    comment: "",
                                    group: 1001,
                                    home: "/home/demoUser1",
                                    move_home: false,
                                    name: "demoUser1",
                                    shell: "",
                                    state: "present",
                                    uid: 1001
                                }
                            },
                            task: {
                                id: "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                name: "User account state check"
                            }
                        },
                        {
                            hosts: {
                                "192.168.122.21": {
                                    _ansible_no_log: false,
                                    changed: false,
                                }
                            },
                            task: {
                                id: "cda1673a-9ea1-4852-ad83-745f076058c8",
                                name: "Perform system update"
                            }
                        }
                    ]
                }
            ],
            stats: {
                "192.168.122.21": {
                    changed: 0,
                    failures: 0,
                    ok: 3,
                    skipped: 0,
                    unreachable: 0
                }
            }
        };

        let provider = new Provider();
        let history = new History(provider.engine,"192.168.122.21");
        let date1 = Date.parse("2016-08-21");
        let date2 = Date.parse("2016-09-14");
        history.addEntry(date1, entry1);
        history.addEntry(date2, entry2);
        let entries = history.getEntriesFromTo("2014-01-01","2017-01-01");
        expect(entries.length).to.equal(2);
        entries = history.getEntriesFromTo("2016-08-22","2017-01-01");
        expect(entries.length).to.equal(1);
    });


});
