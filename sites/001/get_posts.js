import { PuppeteerRealBrowser } from "#root/puppeteer-real-browser.js";
import { config } from "#root/config.js";
import { sleep } from "#root/utils/sleep.js";
import { autoScroll } from "#root/utils/auto_scroll.js";
import { readFile, writeFile } from "#root/utils/file.js";

(async () => {
    const { browser, page } = await PuppeteerRealBrowser(config);

    let params = process.argv.slice(2);
    let list = await readFile("data/001/posts.json");

    let domain = process.env["001_DOMAIN"];
    let user = params[0];
    let totalPages = params[1];
    let mode = params[2];

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

    console.log(`Total Pages: ${totalPages}`);
    console.log(`Total Posts: ${list.length}`);

    await browser.close();
    process.exit();
})();
