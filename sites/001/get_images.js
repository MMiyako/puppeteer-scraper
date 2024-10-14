import { PuppeteerRealBrowser } from "#root/puppeteer-real-browser.js";
import { config } from "#root/config.js";
import { sleep } from "#root/utils/sleep.js";
import { readFile, appendFile, truncateFile } from "#root/utils/file.js";

(async () => {
    const { browser, page } = await PuppeteerRealBrowser(config);

    let params = process.argv.slice(2);
    let posts = await readFile("data/001/posts.json");

    await truncateFile("data/001/images.txt");

    let i = 1;

    for (let post of posts) {
        if (post.mode == params[0]) {
            await page.goto(post.url, { waitUntil: "domcontentloaded" });

            await sleep(2000);

            let elements = await page.$$("a.js-main-image-link");

            for (let element of elements) {
                let url = await page.evaluate((el) => el.href, element);
                let parseURL = url.replace("?auto=format&lossless=0", "");
                await appendFile("data/001/images.txt", `${parseURL}\n`);
            }

            console.log(`Now: ${i}`);

            i++;
        }
    }

    await browser.close();
    process.exit();
})();
