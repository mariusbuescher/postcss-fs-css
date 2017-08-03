const postcss = require('postcss');
const fs = require('fs');

fs.readFile('test/test.css', (err, data) => {
    if (err) {
        console.log(err.message);
        exit(1);
    }

    postcss([
        require('./index.js')()
    ]).process(data.toString()).then((result) => {
        fs.readFile('test/expected.css', (err, expected) => {
            if (err) {
                console.log(err.message);
                exit(1);
            }

            if (expected.toString().trim() !== result.trim()) {
                console.log('Problems with css transformation.');
                exit(2);
            } else {
                console.log('Everything fine.');
                exit(0);
            }
        });
    }).catch(() => {
        console.log('Problem when rendering the css');
        exit(1);
    });
});
