let matches = [];           // Array to store spans of each match
let currentMatchIndex = -1; // Index of the currently selected match
let debounceTimeout = null; // For debouncing input

// Listen for the command to open the fuzzy find input
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openFuzzyFind") {
        let inputBox = document.getElementById("fuzzy-find-input");
        if (!inputBox) {
            inputBox = document.createElement("input");
            inputBox.id = "fuzzy-find-input";
            inputBox.type = "text";
            inputBox.style.position = "fixed";
            inputBox.style.top = "10px";
            inputBox.style.right = "10px"; // Top-right as requested
            inputBox.style.zIndex = "9999";
            inputBox.style.padding = "5px";
            inputBox.style.width = "300px";
            document.body.appendChild(inputBox);

            inputBox.addEventListener("input", (e) => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => handleInput.call(e.target), 200); // 200ms debounce
            });

            inputBox.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    if (event.shiftKey) {
                        if (matches.length > 0) {
                            currentMatchIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
                            highlightSelectedMatch();
                        }
                    } else {
                        if (matches.length > 0) {
                            currentMatchIndex = (currentMatchIndex + 1) % matches.length;
                            highlightSelectedMatch();
                        }
                    }
                } else if (event.key === "Escape") {
                    removeHighlights();
                    inputBox.remove();
                }
            });
        }
        inputBox.focus();
    }
});

// Process input with optimizations for large text
function handleInput() {
    removeHighlights();
    matches = [];
    currentMatchIndex = -1;
    const query = this.value.trim().toLowerCase();
    if (query === "") return;

    const textNodes = getAllTextNodes();
    const maxMatches = 100; // Limit to prevent overload

    for (const textNode of textNodes) {
        const text = textNode.nodeValue.toLowerCase();
        const nodeMatches = findMatchesInNode(text, query, maxMatches - matches.length);
        if (nodeMatches.length > 0) {
            const posToSpan = highlightTextNode(textNode, nodeMatches.flat());
            nodeMatches.forEach(match => {
                matches.push(match.map(pos => posToSpan[pos]));
            });
        }
        if (matches.length >= maxMatches) break;
    }

    if (matches.length > 0) {
        currentMatchIndex = 0;
        highlightSelectedMatch();
    }
}

// Find non-overlapping matches in a single text node
function findMatchesInNode(text, query, maxMatches) {
    const matches = [];
    let pos = 0;
    const queryChars = query.split('');

    while (pos < text.length && matches.length < maxMatches) {
        const match = findNextMatch(text, queryChars, pos);
        if (!match) break;
        matches.push(match);
        pos = match[match.length - 1] + 1; // Skip past this match
    }
    return matches;
}

// Find the next match starting from pos with locality preference
function findNextMatch(text, queryChars, startPos) {
    const match = [];
    let currentPos = startPos;

    for (const char of queryChars) {
        while (currentPos < text.length && text[currentPos] !== char) {
            currentPos++;
        }
        if (currentPos >= text.length) return null;
        match.push(currentPos);
        currentPos++;
    }
    return match;
}

// Highlight positions in a specific text node
function highlightTextNode(textNode, positions) {
    if (!(textNode instanceof Node) || textNode.nodeType !== Node.TEXT_NODE) {
        console.error("Invalid textNode:", textNode);
        return {};
    }
    const parent = textNode.parentNode;
    const text = textNode.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastPos = 0;
    const localPosToSpan = {};

    const sortedPositions = [...new Set(positions)].sort((a, b) => a - b);
    sortedPositions.forEach(pos => {
        if (pos > lastPos) {
            fragment.appendChild(document.createTextNode(text.substring(lastPos, pos)));
        }
        const span = document.createElement("span");
        span.className = "fuzzy-find-highlight";
        span.style.backgroundColor = "yellow";
        span.textContent = text[pos];
        fragment.appendChild(span);
        localPosToSpan[pos] = span;
        lastPos = pos + 1;
    });
    if (lastPos < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastPos)));
    }
    parent.replaceChild(fragment, textNode);
    return localPosToSpan;
}

// Highlight the selected match
function highlightSelectedMatch() {
    matches.forEach((match, index) => {
        const color = index === currentMatchIndex ? "orange" : "yellow";
        match.forEach(span => span.style.backgroundColor = color);
    });
    if (currentMatchIndex >= 0) {
        matches[currentMatchIndex][0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

// Remove all highlights
function removeHighlights() {
    const highlights = document.querySelectorAll(".fuzzy-find-highlight");
    highlights.forEach((span) => {
        const textNode = document.createTextNode(span.textContent);
        span.parentNode.replaceChild(textNode, span);
    });
    document.body.normalize();
}

// Get all text nodes on the page
function getAllTextNodes() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    return textNodes;
}