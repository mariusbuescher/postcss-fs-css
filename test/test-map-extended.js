const postcss = require('postcss');
const fs = require('fs');

console.log('Testing extended mapped files');
fs.readFile('test/test.css', (err, data) => {
    if (err) {
        console.log(err.message);
        process.exit(1);
    }

    postcss([
        require('../index.js')({
            fileMapping: {
                'fonts/sample.woff': {
                    referenceName: 'sample_1',
                    abs: 'test'
                }
            }
        })
    ]).process(data.toString()).then((result) => {
        fs.readFile('test/expected-map-extended.css', (err, expected) => {
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