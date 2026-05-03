const fs = require('fs');
const html = fs.readFileSync('C:\\My portfolio\\p_dump.html', 'utf8');
const p1 = html.split('<script id="__NEXT_DATA__" type="application/json">')[1];
if (p1) {
    const dataJSON = p1.split('</script>')[0];
    const data = JSON.parse(dataJSON);
    const element = data.props.pageProps.element;
    if (element) {
        fs.writeFileSync('C:\\My portfolio\\c.css', element.css);
        fs.writeFileSync('C:\\My portfolio\\h.html', element.html);
        console.log('Extracted!');
    } else {
        console.log('Element not found in JSON');
    }
} else {
    console.log('__NEXT_DATA__ not found');
}
