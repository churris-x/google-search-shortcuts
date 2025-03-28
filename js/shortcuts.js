'use strict';

(function () {
    // Enforce that the script is only run on search result pages (Google Search or Google Scholar)
    const isResultsPage = document.querySelector('html[itemtype="http://schema.org/SearchResultsPage"], .gs_r');
    if (!isResultsPage) return;


    const addHighlightStyles = ({ styleSelectedSimple, styleSelectedFancy }) => {
        const body = document.body;

        if (styleSelectedSimple || styleSelectedFancy) body.classList.add('useHighlight');
        if (styleSelectedSimple) body.classList.add('useSimpleHighlight');
        if (styleSelectedFancy) body.classList.add('useFancyHighlight');
    };

    const addNavigationListener = ({
        navigateWithTabs,
        navigateWithArrows,
        navigateWithJK,
        activateSearch,
        selectTextInSearchbox,
        addSpaceOnFocus,
    }) => {
        const searchBox = document.querySelector('form[role="search"] textarea:nth-of-type(1)');

        window.addEventListener('keydown', event => {
            const isInputOrModifierActive = shortcuts.isInputActive() || shortcuts.hasModifierKey(event);

            const isPrintable = 'abcdefghijklmnopqrstuvwxyz0123456789-=;,./`'.includes(event.key);

            const shouldNavigateNext =
                (navigateWithArrows && event.key === 'ArrowDown' && !isInputOrModifierActive) ||
                (navigateWithJK     && event.key === 'j' && !isInputOrModifierActive) ||
                (navigateWithTabs   && event.key === 'Tab' && !event.shiftKey)
                
            const shouldNavigateBack =
                (navigateWithArrows && event.key === 'ArrowUp' && !isInputOrModifierActive) ||
                (navigateWithJK     && event.key === 'k'   && !isInputOrModifierActive) ||
                (navigateWithTabs   && event.key === 'Tab' && event.shiftKey)
                
            const shouldActivateSearch = !isInputOrModifierActive && (
                (activateSearch === true && isPrintable) ||
                (activateSearch !== false && event.key === activateSearch)
            )
                
            const shouldActivateSearchAndHighlightText = !isInputOrModifierActive &&
                selectTextInSearchbox && event.key === 'Escape';

            if (shouldNavigateNext || shouldNavigateBack) {
                event.preventDefault();
                event.stopPropagation();
                shortcuts.focusResult(shouldNavigateNext ? 1 : -1);
            } else if (shouldActivateSearch) {
                // Otherwise, force caret to end of text and focus the search box
                if (addSpaceOnFocus) {
                    searchBox.value += ' ';
                }
                const searchBoxLength = searchBox.value.length;
                searchBox.focus();
                searchBox.setSelectionRange(searchBoxLength, searchBoxLength);
            } else if (shouldActivateSearchAndHighlightText) {
                window.scrollTo(0, 0);
                searchBox.focus();
                searchBox.select();
            }
        });

        window.addEventListener('keyup', event => {
            if (
                !shortcuts.isInputActive() &&
                !shortcuts.hasModifierKey(event) &&
                navigateWithJK &&
                event.key === '/'
            ) {
                if (addSpaceOnFocus) searchBox.value += ' ';
                searchBox.focus();
            }
        });
    };

    // Load options
    shortcuts.loadOptions((options = shortcuts.defaultOptions) => {
        addHighlightStyles(options);
        addNavigationListener(options);

        // Auto select the first search result
        if (options.autoselectFirst === true) {
            shortcuts.focusResult(1);
        }
    });
})();
