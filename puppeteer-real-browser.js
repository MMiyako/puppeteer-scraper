// https://github.com/zfcsoftware/puppeteer-real-browser

import { Launcher, launch } from "chrome-launcher";
import CDP from "chrome-remote-interface";
import axios from "axios";
import puppeteer from "puppeteer-core";

export const PuppeteerRealBrowser = ({ headless = false, chromeFlags = [], chromePath = "", userDataDir = "" }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Enable Extensions
            const defaultFlags = Launcher.defaultFlags().filter((flag) => flag !== "--disable-extensions");

            chromeFlags = [...defaultFlags, ...chromeFlags];

            if (headless) {
                chromeFlags = [...chromeFlags, "--headless=new"];
            }

            if (!chromePath) {
                throw new Error("Please provide explicit path of intended Chrome binary.");
            }

            const chrome = await launch({
                ignoreDefaultFlags: true,
                chromeFlags,
                chromePath,
                userDataDir,
            });

            let cdpSession = await CDP({ port: chrome.port });

            const { Network, Page, Runtime } = cdpSession;

            await Runtime.enable();
            await Network.enable();
            await Page.enable();
            await Page.setLifecycleEventsEnabled({ enabled: true });

            let data = await axios
                .get(`http://localhost:${chrome.port}/json/version`)
                .then((response) => {
                    response = response.data;
                    return {
                        browserWSEndpoint: response.webSocketDebuggerUrl,
                        agent: response["User-Agent"],
                    };
                })
                .catch((err) => {
                    throw new Error(err.message);
                });

            const browser = await puppeteer.connect({
                targetFilter: (target) => !!target.url(),
                browserWSEndpoint: data.browserWSEndpoint,
                defaultViewport: null,
            });

            browser.close = async () => {
                if (cdpSession) {
                    await cdpSession.close();
                }
                if (chrome) {
                    await chrome.kill();
                }
            };

            const pages = await browser.pages();
            const page = pages[0];

            if (headless) {
                data.agent = data.agent.replace("HeadlessChrome", "Chrome");
            }

            await page.setUserAgent(data.agent);

            resolve({
                browser: browser,
                page: page,
            });
        } catch (err) {
            console.log(err);
            throw new Error(err.message);
        }
    });
};
