# Fuzzy Find In Page

A Browser extension that enhances the browser's find-in-page feature with fuzzy search capabilities. It allows users to search for text on a webpage using a fuzzy matching algorithm, highlighting matches in real-time as they type—even if the characters aren’t perfectly contiguous.

## Features

- **Fuzzy Matching**: Locate text even with typos (missing letters) or non-adjacent characters.
- **Real-time Highlighting**: See matches highlighted as you type in the search box.
- **Match Navigation**: Press `Enter` for the next match, `Shift+Enter` for the previous one.
- **Locality Preference**: Prioritizes matches where characters are closer together (e.g., within the same line).
- **Quick Exit**: Hit `Escape` to close the search box and clear highlights.

## Installation

Follow these steps to get the extension running locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Venkatasai-102/fuzzy-find-in-page.git
   ```
2. Load into Browser:
    - Open `Manage Extensions` page in the browser.
    - Enable "Developer mode" in the top-right corner.
    - Click "Load unpacked" and select the fuzzy-find-in-page folder.

## Usage
1. Open the Search Box:
    - Press the shortcut `Ctrl+I` by default or `Command+I` in mac to bring up the search box in the top-right corner.
2. Start Searching:
    - Type your search query.
    - Matches highlight in yellow, with the active match in orange.
3. Navigate Matches:
    - `Enter`: Jump to the next match.
    - `Shift+Enter`: Go back to the previous match.
4. Close the Search:
    - Press Escape to dismiss the search box and remove all highlights.

## How It Works
- **Content Script**: Injects the search input box and scans the page’s text nodes for matches.
- **Background Script**: Listens for the shortcut and triggers the content script.
- **Fuzzy Algorithm**: Uses a custom, locality-preferring algorithm to rank and highlight matches.