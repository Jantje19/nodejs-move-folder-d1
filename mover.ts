import { constants, promises } from 'fs';
import { join } from 'path';

/**
 * @param  {string} path
 * @returns Promise
 */
const deleteDir = async (path: string): Promise<string> => {
	try {
		// Try removing with the built-in function first
		// This will throw on non-empty directories
		await promises.rmdir(path, { recursive: true });
	} catch (err) {
		// Recursively delete all files within the directories
		const promiseArr = (await promises.readdir(path)).map(async file => {
			const filePath = join(path, file);

			if ((await promises.stat(filePath)).isDirectory())
				await deleteDir(filePath);
			else
				await promises.unlink(filePath);

			return path;
		});

		await Promise.all(promiseArr);
		await deleteDir(path);
		return path;
	}

	return path;
}

/**
 * @param  {string} path
 * @param  {number=constants.F_OK|constants.W_OK} mode
 * @returns Promise
 */
const fileExists = (path: string, mode: number = constants.F_OK | constants.W_OK): Promise<boolean> => {
	return new Promise(resolve => {
		promises.access(path, mode)
			.then(() => resolve(true))
			.catch(() => resolve(false));
	});
}

/**
 * @param  {string} oldPath
 * @param  {string} newPath
 * @returns Promise
 */
const moveFolderDepth1 = async (oldPath: string, newPath: string): Promise<void> => {
	const oldpathContents = await promises.readdir(oldPath);
	const handleDir = async (path: string, dirName: string): Promise<void> => {
		const newDirPath = join(newPath, dirName);

		if (await fileExists(newDirPath))
			await deleteDir(newDirPath);

		return await promises.rename(path, newDirPath);
	}
	const handleFile = (path: string, fileName: string): Promise<void> => {
		return promises.rename(path, join(newPath, fileName));
	}

	await Promise.all(oldpathContents.map(async val => {
		const filePath = join(oldPath, val);
		if ((await promises.stat(filePath)).isDirectory())
			return await handleDir(filePath, val);
		else
			return await handleFile(filePath, val);
	}));
	await deleteDir(oldPath);
	return;
}

module.exports = { deleteDir, fileExists, moveFolderDepth1 };