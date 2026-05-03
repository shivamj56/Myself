const fs = require('fs');

let css = fs.readFileSync('C:\\My portfolio\\extracted_css.css', 'utf8');

css = css.replace(/\.container/g, '.cyber-container');
css = css.replace(/#card/g, '.cyber-card');
css = css.replace(/\.canvas/g, '.cyber-canvas');
css = css.replace(/\.card-content/g, '.cyber-content');
css = css.replace(/\.title/g, '.cyber-title');
css = css.replace(/\.subtitle/g, '.cyber-subtitle');

// Fix dimensions
css = css.replace(/width: 190px;/g, 'width: 100%; min-height: 254px;');
css = css.replace(/height: 254px;/g, 'height: 100%;');
css = css.replace(/width: 180px;/g, 'width: 100%; transform: scale(0.95);');
css = css.replace(/height: 245px;/g, 'height: 100%; transform: scale(0.95);');

fs.writeFileSync('C:\\My portfolio\\cyber_card.css', css);
console.log('Processed CSS');
