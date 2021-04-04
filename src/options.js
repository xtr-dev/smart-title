
const pageFiltersSelect = document.querySelector('#page-filters');
const removePageFilterButton = document.querySelector('#remove-page-filter');

(async function() {
    pageFiltersSelect.addEventListener('change', onPageFilterChanged);
    removePageFilterButton.addEventListener('click', removePageFilter);

    async function removePageFilter(e) {
        const agree = confirm('Removing a page filter will also remove the associated settings.\nAre you sure you want to continue?');
        if (!agree) {
            e.preventDefault();
            return;
        }

        const settings = await getSettings();
        delete settings.sites[pageFiltersSelect.value];
        await setSettings(settings);
    }

    const pageFilters = await getPageFilters();
    for (const filter of pageFilters) {
        const option = document.createElement('option');
        option.innerHTML = filter;
        option.value = filter;
        pageFiltersSelect.appendChild(option);
    }

    async function onPageFilterChanged() {
        await createForm('options-form', false, pageFiltersSelect.value);
    }
    onPageFilterChanged();
})();