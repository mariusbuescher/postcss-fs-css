const postcss = require('postcss');
const fs = require('fs');

console.log('Testing cache files');
fs.readFile('test/test.css', (err, data) => {
    if (err) {
        console.log(err.message);
        process.exit(1);
    }

    postcss([
        require('../index.js')({
            cacheStrategy: 'revision'
        })
    ]).process(data.toString()).then((result) => {
        fs.readFile('test/expected-cache.css', (err, expected) => {
            if (err) {
                console.log(err.message);
                process.exit(1);
            }

            if (expected.toString().trim() !== result.css.trim()) {
                console.log('Problems with css transformation.');
                console.log('Expected result:');
                console.log(expected.toString());
                console.log('Actual result:');
                console.log(result.css);
                process.exit(2);
            } else {
                console.log('Everything fine.');
                process.exit(0);
            }
        });
    }).catch((e) => {
        console.log('Problem when rendering the css');
        process.exit(1);
    });
});