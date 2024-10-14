async function autoScroll(page) {
    await page.evaluate(async () => {
        let scrollPosition = 0;
        let documentHeight = document.body.scrollHeight;

        while (documentHeight > scrollPosition) {
            window.scrollBy(0, documentHeight);
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            scrollPosition = documentHeight;
            documentHeight = document.body.scrollHeight;
        }
    });
}

export { autoScroll };
