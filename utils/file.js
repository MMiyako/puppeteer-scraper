import fs from "fs";

const fsp = fs.promises;

const fileExists = async (file) => {
    try {
        await fsp.access(file);
        return true;
    } catch (error) {
        return false;
    }
};

const readFile = async (file) => {
    if (await fileExists(file)) {
        let fileData = await fsp.readFile(file, "utf8");
        let jsonData = JSON.parse(fileData);
        return jsonData;
    } else {
        return false;
    }
};

const writeFile = async (file, data) => {
    await fsp.writeFile(file, JSON.stringify(data, null, 4));
};

const appendFile = async (file, data) => {
    await fsp.appendFile(file, data);
};

const truncateFile = async (file) => {
    await fsp.truncate(file);
};

export { readFile, writeFile, appendFile, truncateFile };
