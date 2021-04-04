const {contextMenus, tabs, storage, runtime} = chrome;

try {
    runtime.onInstalled.addListener(function () {
        contextMenus.create({
            id: 'set_new_title',
            title: "Set as title",
            documentUrlPatterns: ["*://*/*"],
            contexts: ["all"],
            visible: true
        });
    });

    contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'set_new_title') {
            tabs.sendMessage(tab.id, {action: 'set_new_title'});
        }
    });
} catch (e) {
    console.error(e);
}