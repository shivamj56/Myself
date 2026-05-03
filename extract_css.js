const fs = require('fs');
const html = fs.readFileSync('C:\\My portfolio\\p_dump.html', 'utf8');

const preMatch = html.match(/<pre[^>]*>(.*?)<\/pre>/s);
if (preMatch) {
    let cssText = preMatch[1];

    // Remove the line numbers since they render as text but are inside <span class="editorLineNumber">
    // Actually, let's just use regex to remove everything inside tags, but wait: line numbers are just text inside tags.
    // If I use string replacement, the line numbers will get concatenated.
    // Let's remove the whole <span class="editorLineNumber">...</span> tag first.
    cssText = cssText.replace(/<span class="editorLineNumber">.*?<\/span>/g, '');

    // Replace <br> and similar with newlines
    cssText = cssText.replace(/<br\s*\/?>/g, '\n');

    // Finally remove all other tags
    cssText = cssText.replace(/<[^>]*>/g, '');

    // Fix HTMLEntities
    cssText = cssText.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    fs.writeFileSync('C:\\My portfolio\\extracted_css.css', cssText);
    console.log('CSS Extracted.');
} else {
    console.log('No <pre> found.');
}
