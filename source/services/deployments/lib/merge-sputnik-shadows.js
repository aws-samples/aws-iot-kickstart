
const merge = require('deepmerge');

// TODO: check if we can use this for the greengrass stuff ?

module.exports = function (parent, child) {

    if (parent === null || parent === undefined) {
        parent = {};
    }
    if (child === null || child === undefined) {
        child = {};
    }

    return merge(parent, child);
};
