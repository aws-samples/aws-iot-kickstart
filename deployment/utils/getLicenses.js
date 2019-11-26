const checker = require('license-checker');

const packageJSON = require('../../source/console/package.json').dependencies;
const packages = Object.keys(packageJSON).reduce((total, value) => {
    return `${total};${value}@${packageJSON[value].replace('~', '').replace('^', '')}`;
}, '');

// console.log(packages);

checker.init(
    {
        start: '../../source/console',
        direct: true,
        production: true,
        packages: packages
    },
    (err, packages) => {
        if (err) {
            console.error('ERROR', err);
        } else {
            Object.keys(packages).forEach(key => {
                console.log(key, 'under the', packages[key].licenses, 'license');
            });
            // console.log(packages);
        }
    }
);
