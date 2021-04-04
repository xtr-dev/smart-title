let contextTarget = null;
let updateInterval = -1;
let originalTitle = '';
let failures = 0;
document.addEventListener('contextmenu', e => {
    contextTarget = e.target;
}, true);

const simmer = Simmer.noConflict();

/**
 * Sets the elementSelector of the current tab's settings
 * Called when 'set new title' context menu item is clicked
 *
 * @return {Promise<void>}
 */
async function setNewTitle() {
    const targetSelector = simmer(contextTarget);
    const filter = (await matchesPageFilter() && await getMatchingPageFilter()) || escapeRegExp(window.location.href);
    await updateFilterSettings(filter, {elementSelector: targetSelector});
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === 'set_new_title') {
            setNewTitle();
        }
        sendResponse('ok');
        return true;
    }
);

/**
 * Called by the setInterval timer to update the tab's title according to settings
 *
 * @return {Promise<void>}
 */
async function updateTitle() {
    try {
        const settings = await getMatchingPageSettings();
        const titleEl = document.querySelector(settings.elementSelector);
        const title = titleEl ? titleEl.innerText.trim() : '! Element not found';
        document.title = settings.format.replace('{title}', title);
    }
    catch (e) {
        console.error(`Error while updating title (${++failures}/5)`);
        if (failures >= 5 && updateInterval !== -1) {
            clearInterval(updateInterval);
            updateInterval = -1;
            failures = 0;
        }
    }
}

/**
 * Starts/stops the setInterval timer based on the passed settings
 * @param settings the settings
 *
 * @return {Promise<void>}
 */
async function toggleTimer(settings) {
    if (updateInterval !== -1) {
        clearInterval(updateInterval);
    }

    if (settings.enabled) {
        if (!originalTitle) {
            originalTitle = document.title;
        }
        updateInterval = setInterval(updateTitle, settings.interval * 1000);
    }
    else if (originalTitle) {
        document.title = originalTitle;
    }
}

/**
 * Reload the settings when changed
 *
 * @return {Promise<void>}
 */
async function reloadSettings() {
    if (!(await matchesPageFilter())) {
        return;
    }

    const settings = await getMatchingPageSettings();
    toggleTimer(settings);
}

chrome.storage.onChanged.addListener(reloadSettings);
reloadSettings();