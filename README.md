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

## Example Usage

```javascript
// Find the first matching element
xfind('downloads-item:nth-child(4) #remove');

// Find all matching elements
xfindAll('#downloads-list .is-active a[href^="https://"]');
