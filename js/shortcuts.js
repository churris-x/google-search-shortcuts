
'use strict';

// Enforce that the script is only run on search result pages (Google Search or Google Scholar)
const isResultsPage = document.querySelector('html[itemtype="http://schema.org/SearchResultsPage"], .gs_r');
if (isResultsPage) {
  initShortcuts();
}

function initShortcuts() {
  // If we changed the search, reinitialize selected link index to 0
  const lastSearchURL = sessionStorage.getItem('lastSearchURL');
  if (location.href !== lastSearchURL) {
    sessionStorage.setItem('lastLinkIndex', 0);
  }
  sessionStorage.setItem('lastSearchURL', location.href);

  // Focus on saved link index
  const lastLinkIndex = sessionStorage.getItem('lastLinkIndex');
  if (lastLinkIndex !== null) {
    shortcuts.focusResult(lastLinkIndex);
  }

  const addHighlightStyles = ({ styleSelectedSimple, styleSelectedFancy }) => {
    const body = document.body;
    if (styleSelectedSimple || styleSelectedFancy) body.classList.add('useHighlight');
    if (styleSelectedSimple) body.classList.add('useSimpleHighlight');
    if (styleSelectedFancy) body.classList.add('useFancyHighlight');
  };

  const addNavigationListener = (options) => {
    const searchBox = document.querySelector('form[role="search"] textarea:nth-of-type(1)');

    const navigateToTab = (tabSelector) => {
      const tabLink = document.querySelector(tabSelector);
      if (tabLink) tabLink.click();
    };

    const navigateToMaps = () => {
      if (searchBox) {
        const searchQuery = encodeURIComponent(searchBox.value);
        window.location.href = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
      }
    }

    window.addEventListener('keydown', (event) => {
      const isInputActive = shortcuts.isInputActive();

      // Handle Google shortcuts
      if (options.enableGoogleShortcuts && !isInputActive && !(event.altKey || event.metaKey || event.ctrlKey)) {
        switch (event.key) {
          case 'A':  // A for All
            navigateToTab('a[href^="/search"][href*="q="]:not([href*="tbm="]):not([href*="udm="])');
            return;
          case 'I':  // I for Images
            navigateToTab('a[href*="tbm=isch"], a[href*="udm=2&"], a[href$="udm=2"]');
            return;
          case 'V':  // V for Videos
            navigateToTab('a[href*="tbm=vid"], a[href*="udm=7&"], a[href$="udm=7"]');
            return;
          case 'M':  // M for Maps
            navigateToMaps();
            return;
          default:
            break;
        }
      }

      const isInputOrModifierActive = isInputActive || shortcuts.hasModifierKey(event);

      const shouldNavigateNext = (options.navigateWithArrows && event.key === 'ArrowDown' && !isInputOrModifierActive) ||
        (options.navigateWithTabs && event.key === 'Tab' && !event.shiftKey) ||
        (options.navigateWithJK && event.key === 'j' && !isInputOrModifierActive);

      const shouldNavigateBack = (options.navigateWithArrows && event.key === 'ArrowUp' && !isInputOrModifierActive) ||
        (options.navigateWithTabs && event.key === 'Tab' && event.shiftKey) ||
        (options.navigateWithJK && event.key === 'k' && !isInputOrModifierActive);

      if (shouldNavigateNext || shouldNavigateBack) {
        event.preventDefault();
        event.stopPropagation();
        shortcuts.focusResult(shortcuts.focusIndex + (shouldNavigateNext ? 1 : -1));
        return
      }

      const isPrintable = /^[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/i.test(event.key);

      // Activate search: force caret to end of text and focus the search box
      if (!isInputOrModifierActive && options.activateSearch && isPrintable) {
        if (options.addSpaceOnFocus) searchBox.value += ' ';
        const searchBoxLength = searchBox.value.length;
        searchBox.focus();
        searchBox.setSelectionRange(searchBoxLength, searchBoxLength);
        return
      }

      if (!isInputOrModifierActive && options.selectTextInSearchbox && event.key === 'Escape') {
        window.scrollTo(0, 0);
        searchBox.focus();
        searchBox.select();
      }
    });

    window.addEventListener('keyup', (event) => {
      if (!shortcuts.isInputActive() && !shortcuts.hasModifierKey(event) && options.navigateWithJK && event.key === '/') {
        if (options.addSpaceOnFocus) searchBox.value += ' ';
        searchBox.focus();
      }
    });

    let clickedInsideSuggestions = false;
    const suggestionPane = document.querySelector('div[role="presentation"]');

    suggestionPane.addEventListener('mousedown', () => {
      clickedInsideSuggestions = true;
    });

    // Simulate a click in document body to hide suggestions, but only if the search input has been blurred
    // via an Escape or a click outside of suggestion pane. If the click is inside, don't blur to select suggestion
    searchBox.addEventListener('blur', () => {
      setTimeout(() => {
        if (!clickedInsideSuggestions) {
          document.querySelector('body').click();
        }
        clickedInsideSuggestions = false;
      }, 0);
    });
  };

  shortcuts.loadOptions((options) => {
    addHighlightStyles(options);
    addNavigationListener(options);

    // Auto select the first search result
    if (options.autoselectFirst && lastLinkIndex === null) shortcuts.focusResult(0);
  });
}

