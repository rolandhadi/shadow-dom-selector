# Shadow DOM Selector (xfind)

A JavaScript library to locate elements in the DOM, including those within shadow DOMs, using complex n-depth selectors.

## Description

This library allows you to find elements on a webpage, even if they are nested within shadow DOMs. It traverses the DOM tree to locate the correct element, eliminating the need to specify all shadow roots.

## Features

- Locate the first matching element using a complex selector.
- Find all matching elements using a complex selector.
- Traverse through shadow DOMs to find elements.
- Validate CSS selectors.
- Highlight found elements for debugging.

## Installation
- Using Browser Console
  - You can use the [Shadow DOM Selector library](https://raw.githubusercontent.com/rolandhadi/shadow-dom-selector/main/xfind.min.js) directly by pasting the following JavaScript code into your browser's console:
- Using as a Snippet
  - You can also [save the code](https://raw.githubusercontent.com/rolandhadi/shadow-dom-selector/main/xfind.min.js) as a snippet in your browser's developer tools:
      - Open your browser's developer tools (usually by pressing F12 or right-clicking on the page and selecting "Inspect").
      - Go to the "Sources" tab.
      - In the left panel, right-click in the "Snippets" section and select "New Snippet".
      - Name your snippet (e.g., "Shadow DOM Selector").
      - Copy and paste the entire JavaScript code into the snippet editor.
      - Save the snippet.
  - To run the snippet:
      - Open the developer tools.
      - Go to the "Sources" tab.
      - Select your snippet from the "Snippets" section.
      - lick the "Run" button (or press Ctrl+Enter) to execute the snippet.

## Example Usage

```javascript
// Find the first matching element
xfind('downloads-item:nth-child(4) #remove');

// Find all matching elements
xfindAll('#downloads-list .is-active a[href^="https://"]');
