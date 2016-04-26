/**
 * Created by mark on 2016/02/28.
 */

import pg from 'pg';
import Provider from '../Provider';
import logger from '../Logger';

class Database {

    constructor(provider) {
        if (!provider || !provider instanceof Provider) {
            throw new Error("The parameter provider must be of type Provider");
        }
        let user = provider.config.get("dbuser");
        let host = provider.config.get("dbhost");
        let passwd = provider.config.get("dbpasswd");
        let port = provider.config.get("dbport");
        let database = provider.config.get("dbname");
        this.connString = `postgres://${user}:${passwd}@${host}:${port}/${database}`;
    }

    initHost(name) {
        return new Promise((resolve, reject)=> {
            pg.connect(this.connString, (err, client, done)=> {
                let sql = "Insert into host (name) values($1)";
                client.query(sql, name, (err, result)=> {
                    if (err) {
                        done();
                        reject(err);
                    } else {
                        done();
                        resolve(result);
                    }
                });
            });
        });
    }

    dropTables() {
        return new Promise((resolve, reject) => {
            pg.connect(this.connString, (err, client, done)=> {
                if (err) {
                    reject(err);
                    logger.logAndThrow(err);
                } else {
                    let sql = "drop table if exists ansibleLog; " +
                        "drop table if exists ansiblePlaybook; " +
                        "drop table if exists hostConfig; " +
                        "drop table if exists host; " +
                        "drop index if exists hostname; ";

                    client.query(sql, (err)=> {
                        if (err) {
                            done();
                            logger.logAndThrow("Error dropping database tables. " + err);
                        } else {
                            done();
                            resolve("Successfully dropped database tables.");
                        }
                    });
                }
            });
        });
    }

    createTables() {
        let promise = new Promise((resolve, reject) => {
            pg.connect(this.connString, (err, client, done)=> {
                if (err) {
                    reject(err);
                    logger.logAndThrow(err);
                } else {
                    let sql = "create table if not exists host(" +
                        "id serial primary key, " +
                        "dateCreated timestamp with time zone default now()," +
                        "name varchar(255)," +
                        "machineId uuid," +
                        "other jsonb); ";

                    sql += "create table if not exists hostConfig(" +
                        "id serial primary key," +
                        "hostId int references host(id)," +
                        "dateCreated timestamp with time zone default now()," +
                        "original jsonb," +
                        "parsed jsonb," +
                        "facts jsonb," +
                        "active boolean); ";

                    sql += "create table if not exists ansiblePlaybook(" +
                        "id serial primary key," +
                        "hostId int references host(id)," +
                        "dateCreated timestamp with time zone default now()," +
                        "playbook text); ";

                    sql += "create table if not exists ansibleLog(" +
                        "id serial primary key," +
                        "hostId int references host(id)," +
                        "dateCreated timestamp with time zone," +
                        "pid int," +
                        "runUser varchar(255)," +
                        "engine varchar(255)," +
                        "log text);";

                    client.query(sql, (err)=> {
                        if (err) {
                            done();
                            logger.logAndThrow("Error creating database tables. " + err);
                        } else {
                            done();
                            resolve("Successfully created database tables.");
                        }
                    });
                }
            });
        });

        return promise.then((result)=> {
            return new Promise((resolve)=> {
                pg.connect(this.connString, (err, client, done)=> {
                    let sql = "create unique index hostname on host(name);";
                    client.query(sql, (err)=> {
                        if (err) {
                            console.log(err);
                            done();
                            logger.logAndThrow("Error creating indices on tables. " + err);
                        } else {
                            done();
                            resolve("Successfully created indices on tables.");
                        }
                    });
                })
            });

        });
    }

    saveEngineLog(host, engine, log) {
        pg.connect(this.connString, (err, client, done)=> {
            //client.
        });
    }

}

export default Database;