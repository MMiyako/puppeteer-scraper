import { packageDirectory } from "pkg-dir";
import "dotenv/config";

import { options } from "#root/utils/options.js";

export const config = {
    manual: options.manual,
    headless: options.headless,
    chromePath: process.env["CHROME_PATH"],
    chromeFlags: ["--window-size=1366,768", "--window-position=-5,0"],
    userDataDir: (await packageDirectory()) + "/user_data",
};
