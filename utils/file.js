import fs from "fs";

const fsp = fs.promises;

const readFile = async (file) => {
    let fileData = await fsp.readFile(file, "utf8");
    let jsonData = JSON.parse(fileData);

    return jsonData;
};

const writeFile = async (file, data) => {
    await fsp.writeFile(file, JSON.stringify(data, null, 4));
};

export { readFile, writeFile };
