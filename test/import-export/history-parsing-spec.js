/**
 * Created by mark on 2016/07/30.
 */
import Provider from './../../src/Provider';
import {expect} from 'chai';
import History from '../../src/modules/host/History';
import HistoryManager from '../../src/modules/host/HistoryManager';


describe("HistoryManager should",function(){


    it("export data correctly.", function () {
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


        let results =       {
            host: "192.168.122.21",
            configGroup: "default",
            historyEntries: [
                {
                    entry: {
                        plays: [
                            {
                                "play": {
                                    "id": "3a4757e7-e300-4b2a-aef5-1f314b073764",
                                    "name": "192.168.122.21"
                                },
                                "tasks": [
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "ansible_virtualization_type": "kvm",
                                                "module_setup": true
                                            },
                                            "changed": false,
                                            "invocation": {
                                                "module_args": {
                                                    "fact_path": "/etc/ansible/facts.d",
                                                    "filter": "*",
                                                    "gather_subset": [
                                                        "all"
                                                    ]
                                                },
                                                "module_name": "setup"
                                            }
                                        },
                                        "task": {
                                            "id": "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                            "name": ""
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "append": false,
                                                "changed": false,
                                                "comment": "",
                                                "group": 1001,
                                                "home": "/home/demoUser1",
                                                "move_home": false,
                                                "name": "demoUser1",
                                                "shell": "",
                                                "state": "present",
                                                "uid": 1001
                                            }
                                        },
                                        "task": {
                                            "id": "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                            "name": "User account state check"
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "_ansible_no_log": false,
                                                "changed": false,
                                                "failed": true,
                                                "msg": "Failed to lock apt for exclusive operation"
                                            }
                                        },
                                        "task": {
                                            "id": "cda1673a-9ea1-4852-ad83-745f076058c8",
                                            "name": "Perform system update"
                                        }
                                    }
                                ]
                            }
                        ],
                        "stats": {
                            "192.168.122.21": {
                                "changed": 0,
                                "failures": 1,
                                "ok": 2,
                                "skipped": 0,
                                "unreachable": 0
                            }
                        }
                    },
                    "errors": [
                        {
                            "msg": "Failed to lock apt for exclusive operation",
                            "task": "Perform system update"
                        }
                    ],
                    "status": "failed",
                    "timestamp": 1471737600000
                },
                {
                    "entry": {
                        "plays": [
                            {
                                "play": {
                                    "id": "3a4757e7-e300-4b2a-aef5-1f314b073764",
                                    "name": "192.168.122.21"
                                },
                                "tasks": [
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "ansible_virtualization_type": "kvm",
                                                "module_setup": true
                                            },
                                            "changed": false,
                                            "invocation": {
                                                "module_args": {
                                                    "fact_path": "/etc/ansible/facts.d",
                                                    "filter": "*",
                                                    "gather_subset": [
                                                        "all"
                                                    ]
                                                },
                                                "module_name": "setup"
                                            }
                                        },
                                        "task": {
                                            "id": "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                            "name": ""
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "append": false,
                                                "changed": false,
                                                "comment": "",
                                                "group": 1001,
                                                "home": "/home/demoUser1",
                                                "move_home": false,
                                                "name": "demoUser1",
                                                "shell": "",
                                                "state": "present",
                                                "uid": 1001
                                            }
                                        },
                                        "task": {
                                            "id": "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                            "name": "User account state check"
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "_ansible_no_log": false,
                                                "changed": false
                                            }
                                        },
                                        "task": {
                                            "id": "cda1673a-9ea1-4852-ad83-745f076058c8",
                                            "name": "Perform system update"
                                        }
                                    }
                                ]
                            }
                        ],
                        "stats": {
                            "192.168.122.21": {
                                "changed": 0,
                                "failures": 0,
                                "ok": 3,
                                "skipped": 0,
                                "unreachable": 0
                            }
                        }
                    },
                    "errors": [],
                    "status": "passed",
                    "timestamp": 1473811200000
                }
            ]
        };

        let provider = new Provider();
        let history = new History(provider.engine,"192.168.122.21");
        let date1 = Date.parse("2016-08-21");
        let date2 = Date.parse("2016-09-14");
        history.addEntry(date1, entry1);
        history.addEntry(date2, entry2);
        let h = history.export();
        expect(h).to.deep.equal(results);
    });

    it("import data correctly.", function () {
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


        let json =       {
            host: "192.168.122.21",
            configGroup:"web",
            historyEntries: [
                {
                    entry: {
                        plays: [
                            {
                                "play": {
                                    "id": "3a4757e7-e300-4b2a-aef5-1f314b073764",
                                    "name": "192.168.122.21"
                                },
                                "tasks": [
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "ansible_virtualization_type": "kvm",
                                                "module_setup": true
                                            },
                                            "changed": false,
                                            "invocation": {
                                                "module_args": {
                                                    "fact_path": "/etc/ansible/facts.d",
                                                    "filter": "*",
                                                    "gather_subset": [
                                                        "all"
                                                    ]
                                                },
                                                "module_name": "setup"
                                            }
                                        },
                                        "task": {
                                            "id": "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                            "name": ""
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "append": false,
                                                "changed": false,
                                                "comment": "",
                                                "group": 1001,
                                                "home": "/home/demoUser1",
                                                "move_home": false,
                                                "name": "demoUser1",
                                                "shell": "",
                                                "state": "present",
                                                "uid": 1001
                                            }
                                        },
                                        "task": {
                                            "id": "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                            "name": "User account state check"
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "_ansible_no_log": false,
                                                "changed": false,
                                                "failed": true,
                                                "msg": "Failed to lock apt for exclusive operation"
                                            }
                                        },
                                        "task": {
                                            "id": "cda1673a-9ea1-4852-ad83-745f076058c8",
                                            "name": "Perform system update"
                                        }
                                    }
                                ]
                            }
                        ],
                        "stats": {
                            "192.168.122.21": {
                                "changed": 0,
                                "failures": 1,
                                "ok": 2,
                                "skipped": 0,
                                "unreachable": 0
                            }
                        }
                    },
                    "errors": [
                        {
                            "msg": "Failed to lock apt for exclusive operation",
                            "task": "Perform system update"
                        }
                    ],
                    "status": "failed",
                    "timestamp": 1471737600000
                },
                {
                    "entry": {
                        "plays": [
                            {
                                "play": {
                                    "id": "3a4757e7-e300-4b2a-aef5-1f314b073764",
                                    "name": "192.168.122.21"
                                },
                                "tasks": [
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "ansible_virtualization_type": "kvm",
                                                "module_setup": true
                                            },
                                            "changed": false,
                                            "invocation": {
                                                "module_args": {
                                                    "fact_path": "/etc/ansible/facts.d",
                                                    "filter": "*",
                                                    "gather_subset": [
                                                        "all"
                                                    ]
                                                },
                                                "module_name": "setup"
                                            }
                                        },
                                        "task": {
                                            "id": "36dfb471-f9a7-4f73-852a-472d48d179e0",
                                            "name": ""
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "append": false,
                                                "changed": false,
                                                "comment": "",
                                                "group": 1001,
                                                "home": "/home/demoUser1",
                                                "move_home": false,
                                                "name": "demoUser1",
                                                "shell": "",
                                                "state": "present",
                                                "uid": 1001
                                            }
                                        },
                                        "task": {
                                            "id": "a752de0d-caa1-44e8-85d9-ed3c3b892148",
                                            "name": "User account state check"
                                        }
                                    },
                                    {
                                        "hosts": {
                                            "192.168.122.21": {
                                                "_ansible_no_log": false,
                                                "changed": false
                                            }
                                        },
                                        "task": {
                                            "id": "cda1673a-9ea1-4852-ad83-745f076058c8",
                                            "name": "Perform system update"
                                        }
                                    }
                                ]
                            }
                        ],
                        "stats": {
                            "192.168.122.21": {
                                "changed": 0,
                                "failures": 0,
                                "ok": 3,
                                "skipped": 0,
                                "unreachable": 0
                            }
                        }
                    },
                    "errors": [],
                    "status": "passed",
                    "timestamp": 1473811200000
                }
            ]
        };

        let provider = new Provider();
        let historyManager = new HistoryManager(provider);
        let history1 = historyManager.loadHistory(json);
        let history2 = new History(provider.engine,"192.168.122.21","web");
        let date1 = Date.parse("2016-08-21");
        let date2 = Date.parse("2016-09-14");
        history2.addEntry(date1, entry1);
        history2.addEntry(date2, entry2);
        expect(history1).to.deep.equal(history2);
    });

    

});