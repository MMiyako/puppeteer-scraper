import { input, number, select } from "@inquirer/prompts";

import { PuppeteerRealBrowser } from "#root/puppeteer-real-browser.js";
import { config } from "#root/config.js";
import { sleep } from "#root/utils/sleep.js";
import { autoScroll } from "#root/utils/auto_scroll.js";
import { readFile, writeFile } from "#root/utils/file.js";

(async () => {
    console.log("--------------------------------------------------");

    let users = await readFile("data/001/users.json");

    let user = "";

    let defineUser = await select({
        message: "You need a user:",
        choices: [
            {
                name: "Type a username",
                value: "typeUser",
            },
            {
                name: "Choose a username",
                value: "chooseUser",
            },
        ],
    });

    console.log("--------------------------------------------------");

    if (defineUser == "typeUser") {
        user = await input({ message: "Username:", required: true });
    } else {
        let choices = users.map((user) => {
            return { value: user };
        });

        user = await select({
            message: "Username:",
            choices,
        });
    }

    let mode = await select({
        message: "Mode:",
        choices: [
            {
                value: process.env["001_MODE_01"],
            },
            {
                value: process.env["001_MODE_02"],
            },
            {
                value: process.env["001_MODE_03"],
            },
            {
                value: process.env["001_MODE_04"],
            },
        ],
    });

    let totalPages = await number({ message: "Total Pages:", required: true, default: 1 });

    console.log("--------------------------------------------------");

    const { browser, page } = await PuppeteerRealBrowser(config);

    let list = await readFile("data/001/posts.json");

    let domain = process.env["001_DOMAIN"];

    for (let i = 1; i <= totalPages; i++) {
        await page.goto(domain + `users/${user}/?p=${i}&${process.env["001_MODE_QUERY"]}=${mode}`, {
            waitUntil: "domcontentloaded",
        });

        await sleep(2000);

        await autoScroll(page);

        await sleep(2000);

        let elements = await page.$$("a.is-relative");

        for (let element of elements) {
            let count = 1;
            let multiImages = await element.$(".image_posts_includes_image_post_list_multi_files_mark_count");

            if (multiImages) {
                let imagesCount = await page.evaluate((el) => el.textContent, multiImages);
                count = parseInt(imagesCount);
            }

            let url = await page.evaluate((el) => el.href, element);

            list.push({
                count,
                mode,
                url,
            });
        }
    }

    await writeFile("data/001/posts.json", list);

    if (!users.includes(user)) {
        users.push(user);
        await writeFile("data/001/users.json", users);
    }

    console.log(`Total Posts: ${list.length}`);

    await browser.close();
    process.exit();
})();
