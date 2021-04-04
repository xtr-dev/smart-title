const {contextMenus, tabs, storage, runtime, scripting} = chrome;

/**
 * Get the current tab
 * @return {Promise<?>}
 */
function getActiveTab() {
    return new Promise((resolve, _) => {
        tabs.query({active: true, currentWindow: true}, function (results) {
            resolve(results[0]);
        });
    });
}

/**
 * Returns true if the url (or window.location.href if null) matches any of the available settings
 *
 * @param url the url
 * @return {Promise<?>}
 */
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

/**
 * Escape a string so that it can be included safely into a regex string
 *
 * @see https://stackoverflow.com/a/6969486
 * @param string
 * @return string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Returns the regexp string of the matching page filter
 *
 * @see matchesPageFilter
 * @see getMatchingPageSettings
 * @param url
 * @return {Promise<?>}
 */
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

/**
 * Returns the settings of the matching page filter
 *
 * @see matchesPageFilter
 * @see getMatchingPageFilter
 * @param url
 * @return {Promise<?>}
 */
function getMatchingPageSettings(url = null) {
    return getMatchingPageFilter(url)
        .then(filter => getSettings().then(settings => settings.sites[filter]));
}

/**
 * Get app settings
 *
 * @return {Promise<?>}
 */
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

/**
 * Set app settings
 *
 * @param settings the settings
 * @return {Promise<?>}
 */
function setSettings(settings) {
    return new Promise((resolve, _) => {
        storage.sync.set({
            'settings': settings
        }, function () {
            console.debug('storage.sync.set()', settings);
        });
    });
}

/**
 * Get the page regex filters
 *
 * @return {Promise<string[]>}
 */
function getPageFilters() {
    return getSettings()
        .then(settings => Object.keys(settings['sites'] || {}));
}

/**
 * Update the settings of `filter`
 * @param filter the filter
 * @param filterSettings the settings
 * @return {Promise<?>}
 */
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