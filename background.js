let currentTabId = undefined;

setCurrentTab();

browser.tabs.onActivated.addListener(setCurrentTab);
browser.tabs.onRemoved.addListener(setCurrentTab);

browser.tabs.onCreated.addListener(moveTab);

function moveTab(newTab) {
    if (!currentTabId) {
        return;
    }

    Promise.all([
        browser.windows.getCurrent({
            populate: true
        }),
        browser.tabs.get(currentTabId),
    ]).then((result) => {
        let [currentWindow, currentTab] = result;

        console.log(currentTab);
        if (currentTab.windowId !== newTab.windowId || !currentTab.pinned) {
            return;
        }

        let isRecoveredTab = newTab.index > currentWindow.tabs.length - 1;

        if (isRecoveredTab) {
            return;
        }

        // Move the new tab from pinned tab to the end.
        browser.tabs.move(newTab.id, { index: -1 }).then(() => {
            // Update the sucession of new tab to current tab, current tab is activated after the new tab is closed.
            browser.tabs.moveInSuccession([newTab.id], currentTab.id, { insert: true });
            browser.tabs.show(newTab.id);
        });

    });
}

function setCurrentTab() {
    let query = {
        active: true,
        currentWindow: true,
    };
    browser.tabs.query(query).then(
        (tabs) => {
            if (tabs.length > 0) {
                currentTabId = tabs[0].id;
            }
        }
    );
}
