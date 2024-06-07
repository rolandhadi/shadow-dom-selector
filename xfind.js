/**
 * @description Locates the first matching elements on the page, even within shadow DOMs, using a complex n-depth selector.
 * No need to specify all shadow roots to a button; the tree is traversed to find the correct element.
 *
 * Author: Roland Ross L. Hadi
 * GitHub: https://github.com/rolandhadi/shadow-dom-selector
 */

/**
 * Traverses shadow DOMs to find a specific element using a complex selector.
 * @param {string} selector - The CSS selector to query.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {Element|null} - The found element or null if not found.
 *
 * Example usage:
 *   xfind('downloads-item:nth-child(4) #remove');
 *   xfind('#downloads-list .is-active a[href^="https://"]');
 */
function xfind(selector, root = document) {
    const element = performQuery(selector, false, root);
    console.log(`Found ${element ? 1 : 0} element(s)`);
    return element;
}

/**
 * Traverses shadow DOMs to find all matching elements using a complex selector.
 * @param {string} selector - The CSS selector to query.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {NodeListOf<Element>|Array<Element>} - A list of found elements.
 *
 * Example usage:
 *   xfindAll('downloads-item:nth-child(4) #remove');
 *   xfindAll('#downloads-list .is-active a[href^="https://"]');
 */
function xfindAll(selector, root = document) {
    const elements = performQuery(selector, true, root);
    console.log(`Found ${elements.length} element(s)`);
    return elements;
}

/**
 * Core function to query elements in the shadow DOM.
 * @param {string} selector - The CSS selector to query.
 * @param {boolean} findMany - Whether to find multiple elements or just one.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {Element|Array<Element>|null} - The found element(s) or null if not found.
 */
function performQuery(selector, findMany, root) {
    validateSelector(selector);
    const selectors = selector.split('>>>');
    let currentElement = root;

    for (let i = 0; i < selectors.length; i++) {
        if (i === selectors.length - 1 && findMany) {
            return querySelectorAllXFind(selectors[i], currentElement);
        }
        currentElement = querySelectorXFind(selectors[i], currentElement);
        if (currentElement === null) {
            console.error(`Selector ${selectors[i]} not found`);
            return findMany ? [] : null;
        }
    }
    return currentElement;
}

/**
 * Queries all elements matching the selector in the shadow DOM.
 * @param {string} selector - The CSS selector to query.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {NodeListOf<Element>|Array<Element>} - A list of found elements.
 */
function querySelectorAllXFind(selector, root = document) {
    return queryInShadowDOM(selector, true, root);
}

/**
 * Queries an element in the shadow DOM.
 * @param {string} selector - The CSS selector to query.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {Element|null} - The found element or null if not found.
 */
function querySelectorXFind(selector, root = document) {
    return queryInShadowDOM(selector, false, root);
}

/**
 * Performs a query within shadow DOM.
 * @param {string} selector - The CSS selector to query.
 * @param {boolean} findMany - Whether to find multiple elements or just one.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {Element|Array<Element>|null} - The found element(s) or null if not found.
 */
function queryInShadowDOM(selector, findMany, root) {
    let lightDomElement = root.querySelector(selector);

    if (document.head.createShadowRoot || document.head.attachShadow) {
        if (!findMany && lightDomElement) {
            return lightDomElement;
        }

        const splitSelectors = splitByUnquotedCharacter(selector, ',');
        return splitSelectors.reduce((accumulator, sel) => {
            if (!findMany && accumulator) return accumulator;

            const refinedSelectors = splitByUnquotedCharacter(sel.trim().replace(/\s*([>+~])\s*/g, '$1'), ' ').filter(Boolean);
            const lastIndex = refinedSelectors.length - 1;
            const elementsToMatch = gatherAllElementsXFind(refinedSelectors[lastIndex], root);
            const matchedElements = matchElements(refinedSelectors, lastIndex, root);

            if (findMany) {
                return accumulator.concat(elementsToMatch.filter(matchedElements));
            } else {
                return elementsToMatch.find(matchedElements) || null;
            }
        }, findMany ? [] : null);
    } else {
        return findMany ? root.querySelectorAll(selector) : lightDomElement;
    }
}

/**
 * Matches elements based on the refined selector.
 * @param {Array<string>} refinedSelectors - The split CSS selector.
 * @param {number} lastIndex - The index of the last selector part.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {Function} - A function to match elements.
 */
function matchElements(refinedSelectors, lastIndex, root) {
    return element => {
        let position = lastIndex;
        let currentElement = element;
        while (currentElement) {
            const isMatch = currentElement.matches ? currentElement.matches(refinedSelectors[position]) : false;
            if (isMatch && position === 0) {
                return true;
            }
            if (isMatch) {
                position--;
            }
            currentElement = getParentOrHost(currentElement, root);
        }
        return false;
    };
}

/**
 * Splits a selector by a character, ignoring quoted sections.
 * @param {string} selector - The CSS selector to split.
 * @param {string} character - The character to split by.
 * @returns {Array<string>} - The split selector.
 */
function splitByUnquotedCharacter(selector, character) {
    return selector.match(/\\?.|^$/g).reduce((acc, char) => {
        if (char === '"' && !acc.singleQuote) {
            acc.doubleQuote ^= 1;
            acc.strings[acc.strings.length - 1] += char;
        } else if (char === '\'' && !acc.doubleQuote) {
            acc.singleQuote ^= 1;
            acc.strings[acc.strings.length - 1] += char;
        } else if (!acc.doubleQuote && !acc.singleQuote && char === character) {
            acc.strings.push('');
        } else {
            acc.strings[acc.strings.length - 1] += char;
        }
        return acc;
    }, { strings: [''], doubleQuote: 0, singleQuote: 0 }).strings;
}

/**
 * Gets the parent element or host if within a shadow DOM.
 * @param {Element} element - The current element.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {Element|null} - The parent element or host, or null if at the root.
 */
function getParentOrHost(element, root) {
    const parent = element.parentNode;
    return parent && parent.host && parent.nodeType === 11 ? parent.host : parent === root ? null : parent;
}

/**
 * Collects all elements in the DOM, including those within shadow DOMs.
 * @param {string|null} selector - The CSS selector to filter elements by.
 * @param {Document|ShadowRoot} root - The root element to start the search from.
 * @returns {Array<Element>} - A list of collected elements.
 */
function gatherAllElementsXFind(selector = null, root) {
    const elements = [];

    const collectElements = nodes => {
        for (const node of nodes) {
            elements.push(node);
            if (node.shadowRoot) {
                collectElements(node.shadowRoot.querySelectorAll('*'));
            }
        }
    };

    if (root.shadowRoot) {
        collectElements(root.shadowRoot.querySelectorAll('*'));
    }
    collectElements(root.querySelectorAll('*'));

    return selector ? elements.filter(el => el.matches(selector)) : elements;
}

/**
 * Validates the CSS selector to ensure it is valid.
 * @param {string} selector - The CSS selector to validate.
 */
function validateSelector(selector) {
    try {
        document.createElement('div').querySelector(selector);
    } catch {
        throw new Error(`Invalid selector: ${selector}`);
    }
}

/**
 * Highlights the found elements by adding a temporary outline.
 * @param {Element|Array<Element>} elements - The element or array of elements to highlight.
 */
function highlightElements(elements) {
    const highlight = (el) => {
        const originalOutline = el.style.outline;
        el.style.outline = '2px solid red';
        setTimeout(() => {
            el.style.outline = originalOutline;
        }, 2000);
    };

    if (Array.isArray(elements)) {
        elements.forEach(highlight);
    } else if (elements) {
        highlight(elements);
    }
}

/**
 * Welcome message displayed when the script is run in the browser console.
 */
function showWelcomeMessage() {
    console.log("%cWelcome to Shadow DOM Selector!", "color: green; font-size: 16px;");
    console.log("%cAuthor: Roland Ross L. Hadi", "color: blue; font-size: 14px;");
    console.log("%cGitHub: https://github.com/rolandhadi/shadow-dom-selector", "color: blue; font-size: 14px;");
    console.log("%cExample usage: xfind('downloads-item:nth-child(4) #remove');", "color: orange; font-size: 14px;");
}

// Display the welcome message
showWelcomeMessage();
