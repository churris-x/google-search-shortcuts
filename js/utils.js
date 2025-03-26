const engine = typeof browser !== 'undefined' ? browser : chrome;

// Globals
const shortcuts = {
    defaultOptions: {
        // Add Arrow to selected result
        styleSelectedSimple: false,

        // Add side bar to selected result
        styleSelectedFancy: true,

        // Activate search box when any printable key is pressed
        activateSearch: false,

        // Automatically select the first search result.
        autoselectFirst: false,

        // Navigate with Tab /  Shift + TAB
        navigateWithTabs: false,

        // Navigate with Down /  Up
        navigateWithArrows: true,

        // Navigate with j /  k. "/" focuses searchbox
        // [WARNING: Conflicts with activateSearch. This takes precedence.]
        navigateWithJK: true,

        // Esc = select all text in searchbox
        selectTextInSearchbox: false,

        // Add space on focus
        addSpaceOnFocus: false,

        // Enable Google special bindings
        enableGoogleShortcuts: true,
    },

    focusIndex: -1,

    inputElementIds: ['cwtltblr' /* Google Calculator Widget */],
    inputElementTypes: ['text', 'number', 'textarea'],

    // Finds all currently visible search result links.
    // Unfortunately Google does not clearly mark search result links with a
    // unique selector, so this selector is a brittle heuristic that may break any
    // time Google changes the DOM structure / selectors, requiring a patch update
    // of the addon to be pushed.
    // Perspectively it may be beneficial to make this selector (or all of them)
    // user-configurable, to enable users to temporarily fix it themselves, until
    // a new patch update is out. We may also want to investigate a different
    // approach, that e.g. does not only rely on a query selector, but includes
    // additional heuristics, to improve the resiliency.
    visibleResultsQuerySelector:
        // Select all links in the main search results container, including
        // non-search-result noise, like web cache, feedback, and further UI.
        '#search a' +
        // This selection is further refined with these filters:
        // All actual search results have a `data-ved` attribute, but not all links
        // with that attribute are search results.
        '[data-ved]' +
        // Some of them are interactive UI elements, like web cache, feedback, etc.
        // They can be identified by the lack of a real target `href`.
        ':not([href="#"])' +
        // Google started inlining related questions and their search results as an
        // accordion-type UI in an optional "People also ask" section. All accordion
        // items are collapsed by default and marked as `aria-hidden` in that state.
        // This filter excludes links that are invisible, as they are nested in a
        // hidden ancestor element.
        ':not([aria-hidden="true"] a)',

    resultContainerQuerySelector: 'div.gs_r, div.g, li, td, div[jscontroller]',
    navigationContainerQuerySelector: 'div[role="navigation"] table',
    navigationLinksAndSuggestedSearchesQuerySelector:
        'div[role="navigation"] table a, #botstuff a' +
        // Remove "People also search for" links
        ':not(#bres a)',

    saveOptions(options, callback) {
        engine.storage.sync.set(options, callback);
    },

    loadOptions(callback) {
        engine.storage.sync.get(this.defaultOptions, callback);
    },

    isElementVisible(element) {
        return (
            element &&
            (element.offsetWidth > 0 || element.offsetHeight > 0) &&
            window.getComputedStyle(element, null).visibility !== 'hidden'
        );
    },

    getVisibleResults() {
        const containers = [];
        return [
            // Main items
            ...Array.from(document.querySelectorAll(this.visibleResultsQuerySelector))
            .map(element => ({
                container: this.findContainer(element, containers),
                focusElement: element,
            })),
            // Suggested searches in footer and footer links
            ...Array.from(document.querySelectorAll(this.navigationLinksAndSuggestedSearchesQuerySelector))
            .map(element => ({
                container: element,
                focusElement: element,
            })),
        ].filter(target => target.container !== null && this.isElementVisible(target.focusElement));
    },

    hasModifierKey(event) {
        return event.shiftKey || event.altKey || event.ctrlKey || event.metaKey;
    },

    isInputActive() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.nodeName === 'INPUT' ||
            this.inputElementTypes.includes(activeElement.type) ||
            this.inputElementIds.includes(activeElement.id)
        );
    },

    // Highlight the active result
    // Results without valid containers will be removed.
    findContainer(link, containers) {
        let container = link.closest(this.resultContainerQuerySelector);
        // there must be a better way, by the old gods and new, there must be a better way
        if (!container) {
            container = link.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement
        }

        // Only return valid, unused containers
        if (container && !containers.includes(container)) {
            containers.push(container);
            return container;
        }
        return null;
    },

    // Add custom styling for the selected result (does not apply to footer navigation links)
    addResultHighlight(target) {
        // Don't proceed if the result is already highlighted
        if (target.container.classList.contains('activeSearchResultContainer')) return;

        target.container.classList.add('activeSearchResultContainer');
        target.focusElement.classList.add('activeSearchResult');

        const removeResultHighlight = () => {
            target.container.classList.remove('activeSearchResultContainer');
            target.focusElement.classList.remove('activeSearchResult');
            target.focusElement.removeEventListener( 'blur', removeResultHighlight );
        };

        target.focusElement.addEventListener('blur', removeResultHighlight);
    },

    resultObserver: null,
    scrollTimeout: null,

    focusResult(offset) {
        const results = this.getVisibleResults();

        if (results.length === 0) return;

        // Shift focusIndex and perform boundary checks
        this.focusIndex += offset;
        this.focusIndex = Math.min(this.focusIndex, results.length - 1);
        this.focusIndex = Math.max(this.focusIndex, 0);

        const target = results[this.focusIndex];

        // Scroll the entire result container into view if it's not already.
        const rect = target.container.getBoundingClientRect();

        // Scroll down to 200px at the bottom of the page
        const offsetY = rect.bottom - (window.innerHeight - 200);

        if (offsetY > 0) window.scrollBy(0, offsetY);

        target.focusElement.focus();
        this.addResultHighlight(target);
    },
};
