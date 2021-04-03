const {contextMenus, tabs, storage, runtime, scripting} = chrome;

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     if (namespace === 'sync' && 'settings' in changes) {
//         settings = changes['settings'].newValue;
//     }
// });

function getActiveTab() {
    return new Promise((resolve, _) => {
        tabs.query({active: true, currentWindow: true}, function (results) {
            resolve(results[0]);
        });
    });
}

function matchesPageFilter(url = null) {
    return getSettings().then(settings => {
        if (!('sites' in settings)) {
            return false;
        }
        const siteFilters = Object.keys(settings.sites);
        for (const filter of siteFilters) {
            if (new RegExp(filter).test(url || window.location.href)) {
                return true;
            }
        }
        return false;
    });
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function getMatchingPageFilter(url = null) {
    return getSettings()
        .then(settings => {
            const siteFilters = Object.keys(settings.sites);
            for (const filter of siteFilters) {
                if (new RegExp(filter).test(url || window.location.href)) {
                    return filter;
                }
            }
            throw new Error('no matching filters');
        });
}

function getMatchingPageSettings(url = null) {
    return getMatchingPageFilter(url)
        .then(filter => getSettings().then(settings => settings.sites[filter]));
}

function getSettings() {
    return new Promise((resolve, _) => {
        storage.sync.get('settings', function (result) {
            if ('settings' in result) {
                return resolve(result.settings);
            }
            resolve({
                sites: {}
            });
        });
    });
}

function setSettings(settings) {
    return new Promise((resolve, _) => {
        storage.sync.set({
            'settings': settings
        }, function () {
            console.debug('storage.sync.set()', settings);
        });
    });
}

function updateFilterSettings(filter, filterSettings) {
    return getSettings()
        .then(settings => {
            if (filterSettings === null) {
                delete settings.sites[filter];
            }
            else if (!(filter in settings.sites)) {
                settings.sites[filter] = {
                    interval: 1,
                    enabled: true,
                    elementSelector: '',
                    format: '{title}'
                };
            }
            settings.sites[filter] = Object.assign(settings.sites[filter], filterSettings);
            return setSettings(settings);
        });
}