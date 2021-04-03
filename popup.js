const updateIntervalInput = document.querySelector('#title-update-interval');
const titleFormatInput = document.querySelector('#title-format');
const titleEnabledCheck = document.querySelector('#title-enabled');
const pageFilterInput = document.querySelector('#page-filter');
const elementSelectorInput = document.querySelector('#element-selector');
const removeProtectionButton = document.querySelector('#remove-protection-button');

updateIntervalInput.addEventListener('change', saveSettings);
titleFormatInput.addEventListener('change', saveSettings);
titleEnabledCheck.addEventListener('change', saveSettings);
removeProtectionButton.addEventListener('click', async function (e) {
    e.preventDefault();
    const tab = await getActiveTab();
    scripting.executeScript({
        'function': function () {
            document.addEventListener('contextmenu', e => {
                e.stopImmediatePropagation();
            }, true);
        },
        target: {
            tabId: tab.id
        }
    });
});

//Uncaught (in promise) Error: Extension context invalidated.
//     at global.js:57
//     at new Promise (<anonymous>)
//     at getSettings (global.js:56)
//     at getMatchingPageFilter (global.js:38)
//     at getMatchingPageSettings (global.js:51)
//     at updateTitle (content.js:27)
// (anonymous) @ global.js:57
// getSettings @ global.js:56
// getMatchingPageFilter @ global.js:38
// getMatchingPageSettings @ global.js:51
// updateTitle @ content.js:27
// async function (async)
// updateTitle @ content.js:27
// setInterval (async)
// toggleTimer @ content.js:39
// reloadSettings @ content.js:52
// async function (async)
// reloadSettings @ content.js:47
// (anonymous) @ content.js:56

async function saveSettings() {
    const tab = await getActiveTab();
    const filter = await getMatchingPageFilter(tab.url);
    updateFilterSettings(filter, {
        interval: parseFloat(updateIntervalInput.value),
        format: titleFormatInput.value,
        enabled: !!titleEnabledCheck.checked,
        elementSelector: elementSelectorInput.value
    });
}

async function reloadSettings() {
    const tab = await getActiveTab();
    if (!(await matchesPageFilter(tab.url))) {
        return;
    }

    const filter = await getMatchingPageFilter(tab.url);
    const settings = await getMatchingPageSettings(tab.url);
    updateIntervalInput.value = settings.interval;
    titleFormatInput.value = settings.format;
    titleEnabledCheck.checked = settings.enabled;
    pageFilterInput.value = filter;
    elementSelectorInput.value = settings.elementSelector;
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
    reloadSettings();
});
reloadSettings();