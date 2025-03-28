(function () {
    'use strict';

    // Enforce that the script is only run on search result pages (Google Search or Google Scholar)
    const isResultsPage = document.querySelector('html[itemtype="http://schema.org/SearchResultsPage"], .gs_r');
    if (!isResultsPage) return;

    // Globals
    const KEYS = { UP: 38, DOWN: 40, TAB: 9, J: 74, K: 75, SLASH: 191, ESC: 27 };

    const addHighlightStyles = ({styleSelectedSimple, styleSelectedFancy}) => {
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
            const keyPressed = event.keyCode;
            const isInputOrModifierActive = shortcuts.isInputActive() || shortcuts.hasModifierKey(event)
           
            // From https://stackoverflow.com/questions/12467240/determine-if-javascript-e-keycode-is-a-printable-non-control-character
            const isPrintable =
                (keyPressed >= 48 && keyPressed <= 57)   || // number keys
                (keyPressed >= 65 && keyPressed <= 90)   || // letter keys
                (keyPressed >= 96 && keyPressed <= 111)  || // numpad keys
                (keyPressed >= 186 && keyPressed <= 192) || // ;=,-./` (in order)
                (keyPressed >= 219 && keyPressed <= 222)    // [\]' (in order)
            
            const shouldNavigateNext =
                (navigateWithArrows && keyPressed === KEYS.DOWN && !isInputOrModifierActive) ||
                (navigateWithTabs && keyPressed === KEYS.TAB && !event.shiftKey) ||
                (navigateWithJK && keyPressed === KEYS.J && !isInputOrModifierActive)
                
            const shouldNavigateBack =
                (navigateWithArrows && keyPressed === KEYS.UP && !isInputOrModifierActive) ||
                (navigateWithTabs && keyPressed === KEYS.TAB && event.shiftKey) ||
                (navigateWithJK && keyPressed === KEYS.K && !isInputOrModifierActive)
                
            const shouldActivateSearch = !isInputOrModifierActive && (
                (activateSearch === true && isPrintable) ||
                (activateSearch !== false && keyPressed === activateSearch)
            )
                
            const shouldActivateSearchAndHighlightText = !isInputOrModifierActive &&
                selectTextInSearchbox &&
                keyPressed === KEYS.ESC;

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
                event.keyCode === KEYS.SLASH
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
