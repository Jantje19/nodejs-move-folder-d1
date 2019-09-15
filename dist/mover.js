"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * @param  {string} path
 * @returns Promise
 */
const deleteDir = (path) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try removing with the built-in function first
        // This will throw on non-empty directories
        yield fs_1.promises.rmdir(path, { recursive: true });
    }
    catch (err) {
        // Recursively delete all files within the directories
        const promiseArr = (yield fs_1.promises.readdir(path)).map((file) => __awaiter(void 0, void 0, void 0, function* () {
            const filePath = path_1.join(path, file);
            if ((yield fs_1.promises.stat(filePath)).isDirectory())
                yield deleteDir(filePath);
            else
                yield fs_1.promises.unlink(filePath);
            return path;
        }));
        yield Promise.all(promiseArr);
        yield deleteDir(path);
        return path;
    }
    return path;
});
/**
 * @param  {string} path
 * @param  {number=constants.F_OK|constants.W_OK} mode
 * @returns Promise
 */
const fileExists = (path, mode = fs_1.constants.F_OK | fs_1.constants.W_OK) => {
    return new Promise(resolve => {
        fs_1.promises.access(path, mode)
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
};
/**
 * @param  {string} oldPath
 * @param  {string} newPath
 * @returns Promise
 */
const moveFolderDepth1 = (oldPath, newPath) => __awaiter(void 0, void 0, void 0, function* () {
    const oldpathContents = yield fs_1.promises.readdir(oldPath);
    const handleDir = (path, dirName) => __awaiter(void 0, void 0, void 0, function* () {
        const newDirPath = path_1.join(newPath, dirName);
        if (yield fileExists(newDirPath))
            yield deleteDir(newDirPath);
        return yield fs_1.promises.rename(path, newDirPath);
    });
    const handleFile = (path, fileName) => {
        return fs_1.promises.rename(path, path_1.join(newPath, fileName));
    };
    yield Promise.all(oldpathContents.map((val) => __awaiter(void 0, void 0, void 0, function* () {
        const filePath = path_1.join(oldPath, val);
        if ((yield fs_1.promises.stat(filePath)).isDirectory())
            return yield handleDir(filePath, val);
        else
            return yield handleFile(filePath, val);
    })));
    yield deleteDir(oldPath);
    return;
});
module.exports = { deleteDir, fileExists, moveFolderDepth1 };
