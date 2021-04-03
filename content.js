let contextTarget = null;
let updateInterval = -1;
let originalTitle = '';
document.addEventListener('contextmenu', e => {
    contextTarget = e.target;
}, true);

const simmer = Simmer.noConflict();

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

async function updateTitle() {
    const settings = await getMatchingPageSettings();
    const titleEl = document.querySelector(settings.elementSelector);
    const title = titleEl ? titleEl.innerText.trim() : '! Element not found';
    document.title = settings.format.replace('{title}', title);
}

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

async function reloadSettings() {
    if (!(await matchesPageFilter())) {
        return;
    }

    const settings = await getMatchingPageSettings();
    toggleTimer(settings);
}

chrome.storage.onChanged.addListener(reloadSettings);
reloadSettings();