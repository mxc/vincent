/**
 * Created by mark on 2016/02/25.
 */

import fs from 'fs';
import dateformat from 'dateformat';
import logger from '../Logger';
import path from 'path';
import Host from "../modules/host/Host";

class TextDatastore {

    constructor(provider) {
        this.provider = provider;
        this.dbDir =this.provider.getDBDir();
    }

    makeArchiveDir() {
        let archive = dateformat(new Date, "yyyy-mm-dd-HH:MM:ss");
        let archiveDir = path.resolve(this.dbDir, archive);
        try {
            var stat = fs.statSync(archiveDir);
        } catch (e) {
            logger.info(`${archiveDir} does not exists. It will be created`);
        }
        if (!stat || !stat.isDirectory()) {
            fs.mkdirSync(archiveDir);
            fs.mkdirSync(`${archiveDir}/hosts`);
        }
        return archiveDir;
    }

    saveAll() {
        let historyDir = this.makeArchiveDir();
        let dirItems = fs.readdirSync(this.dbDir);
        dirItems.forEach((item)=> {
            fs.renameSync(this.dbDir + "/" + item, historyDir + "/" + item);
        });
        this.saveUsers(false);
        this.saveGroups(false);
        this.provider.managers.hostManager.validHosts.forEach((host)=> {
            this.saveHost(host, false);
        });
    }

    saveHost(host, backup = true) {
        if (!host instanceof Host) {
            logger.logAndThrow("Host parameter must be of type host");
        }
        let archivePath = "";
        let filename = this.dbDir + `/hosts/${host.name}.json`;
        if (backup) {
            try {
                var exists = fs.statSync(filename);
                if (exists && !exists.isFile()) {
                    archivePath = this.makeArchiveDir() + `/hosts/${host.name}.json`;
                    fs.renameSync(filename, archivePath);
                }
            } catch (e) {
                logger.info(`${filename} does not exist and will not be backed up.`);
            }
        }
        let hostJson = JSON.stringify(host.export(), null, 2);
        fs.writeFileSync(filename, hostJson);
        return archivePath;
    }

    saveUsers(backup = true) {
        let archivePath = "";
        if (backup) {
            let currentPath = path.resolve(this.dbDir + "/users.json");
            try {
                var stat = fs.statSync(currentPath);
                if (stat && !stat.isFile()) {
                    archivePath = this.makeArchiveDir() + "/users.json";
                    fs.renameSync(currentPath, archivePath);
                }
            } catch (e) {
                logger.warn("user.json file does not exists.");
            }
        }
        let users = JSON.stringify(this.provider.managers.userManager.export(), null, 2);
        fs.writeFileSync(this.dbDir + "/users.json", users);
        return archivePath;
    }

    saveGroups(backup = true) {
        let archivePath = "";
        if (backup) {
            let currentPath = path.resolve(this.dbDir + "/groups.json");
            try {
                var stat = fs.statSync(currentPath);
                if (stat && !stat.isFile()) {
                    archivePath = this.makeArchiveDir() + "/groups.json";
                    fs.renameSync(currentPath, archivePath);
                }
            } catch (e) {
                logger.warn("groups.json file does not exists.");
            }
        }
        let groups = JSON.stringify(this.provider.managers.groupManager.export(), null, 2);
        fs.writeFileSync(this.dbDir + "/groups.json", groups);
        return archivePath;
    }

}

export default TextDatastore;