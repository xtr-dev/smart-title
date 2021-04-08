
async function createForm(containerId, showRemoveProtectionOption = false, overrideFilter = null) {
    const url = runtime.getURL("form.html");
    const response = await fetch(url);
    document.getElementById(containerId).innerHTML = await response.text();

    const updateIntervalInput = document.querySelector('#title-update-interval');
    const titleFormatInput = document.querySelector('#title-format');
    const titleEnabledCheck = document.querySelector('#title-enabled');
    const pageFilterInput = document.querySelector('#page-filter');
    const elementSelectorInput = document.querySelector('#element-selector');
    const removeProtectionButton = document.querySelector('#remove-protection-button');
    removeProtectionButton.style.display = !showRemoveProtectionOption ? 'none' : 'block';

    async function saveSettings() {
        const filter = overrideFilter || await getMatchingPageFilter((await getActiveTab()).url);
        await updateFilterSettings(filter, {
            interval: parseFloat(updateIntervalInput.value),
            format: titleFormatInput.value,
            enabled: !!titleEnabledCheck.checked,
            elementSelector: elementSelectorInput.value
        });
    }

    updateIntervalInput.addEventListener('change', saveSettings);
    titleFormatInput.addEventListener('change', saveSettings);
    titleEnabledCheck.addEventListener('change', saveSettings);
    elementSelectorInput.addEventListener('change', saveSettings);
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

    async function reloadSettings() {
        const settings = await getSettings();
        console.log('overrideFilter', overrideFilter);
        const filter = overrideFilter || await getMatchingPageFilter((await getActiveTab()).url);
        console.log('filter', filter);
        const pageSettings = settings.sites[filter];
        updateIntervalInput.value = pageSettings.interval;
        titleFormatInput.value = pageSettings.format;
        titleEnabledCheck.checked = pageSettings.enabled;
        pageFilterInput.value = filter;
        elementSelectorInput.value = pageSettings.elementSelector;
    }
    reloadSettings();
}
