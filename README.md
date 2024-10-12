
# Google Search Shortcuts

This is a fork of [jchafik's extension](https://github.com/jchafik/google-search-shortcuts) that adds back Google Search navigation shortcuts.
From the results page, press any key to bring focus back to the search box. Use the TAB and arrow keys to navigate between search results.

This fork adds a few functionalities:
- **Automatic Link Refocus:** When you select a link (using `Enter`), the index of the link is saved. If you return to the search page (for example, by navigating back in history), the previously selected link is automatically refocused.
- **Dynamic Link Visibility:** As you scroll the search page using the mouse or other methods, the selected link updates to ensure it remains visible.
- **Margin Adjustment:** A minimum distance is maintained between the selected result box and the top and bottom of the page.
- **Hide Suggestion Pane:** The Google suggestion pane that appears while typing in the search input box is automatically hidden when you defocus the box by pressing `Escape`.

The code has been refactored to adhere to modern ES6 standards, and deprecated functions have been removed for improved performance and maintainability.

