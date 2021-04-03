const {contextMenus, tabs, storage, runtime} = chrome;

function getActiveTab() {
    return new Promise((resolve, _) => {
        tabs.query({active: true, currentWindow: true}, function (results) {
            resolve(results[0]);
        });
    });
}

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
            tabs.sendMessage(tab.id, {action: 'set_new_title'}, function (response) {
            });
        }
    });
} catch (e) {
    console.error(e);
}