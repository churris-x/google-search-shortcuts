# Google Search Shortcuts

This is my personal copy of an extension that adds navigation shortcuts to the google search page.

## Table of Contents
- [Features](#features)
- [Todo](#todo)
- [License and Acknowledgements](#license-and-acknowledgements)


## Features
- Use `tab` and `shift + tab` to move up and down result links
- Use `up` and `down` to move up and down results
- Vim mode; `j` moves down, `k` moves up and `/` moves focus to search bar
- `esc` selects all text in searchbox
- Add an arrow to show which result is selected
- Add a blue bar on the side of the result
- Automatically select the first search result
- Add a space when focusing the search box
- `a` shows all results, `i` shows images, `v` shows videos, `m` goes to maps

#### Quality of life
- Margin Adjustment: Selected result has padding when near top or bottom of the page


## Todo
- [x] Make this work on firefox as well
- [x] Fix storage permissions so it doesn't need to use `local` storage
- [x] Make it so if the options return `undefined`, default settings still load
- [x] Fix sidebar styling
- [x] Fix logo being too small
- [x] Create new release
- [ ] Substitute [deprecated keycode](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) with the [key property](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
- [ ] Make all results, images, videos work -> find "Filters and topics" element, then closest() images link and click
- [ ] Add ability to focus on tools? And go to year? T-> time -> Y -> year
- [ ] Fix "Add space when selecting search bar" feature
- [ ] Fix selected result space
- [ ] Remove "Automatically select the first result on images"
- [ ] Allow extension on images?

## License and Acknowledgements
All code is under the [GPL v3 license][gpl3].  
Many thanks to Jacob Chafik and the contributors on the [original extension repository][jchafik].  
Also thanks to Valentin Guillet for his [forked repository][Valentin-Guillet] with extended functionality and cleanup.  
And finally thanks to Kuranari for his [forked repository][kuranari].


[gpl3]: https://www.gnu.org/licenses/gpl-3.0.en.html
[jchafik]: https://github.com/jchafik/google-search-shortcuts
[Valentin-Guillet]: https://github.com/Valentin-Guillet/google-search-shortcuts
[kuranari]: https://github.com/kuranari/google-search-shortcuts
