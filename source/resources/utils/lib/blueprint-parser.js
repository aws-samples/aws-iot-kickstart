'use strict';

const _ = require('underscore');

class ObjectToParse {
    constructor(object) {
        this.object = object;
    }

    setAtt(value) {

    }

    on(value) {

    }

}

/**
 *
 * @class BlueprintParser
 */
class BlueprintParser {

    /**
     * @class BlueprintParser
     * @constructor
     */
    constructor() {
    }

    parse(what, message) {

        const tag = 'BlueprintParser.parse:';
        console.log(tag, 'start', JSON.stringify(what), message);

        const objectToParse = new ObjectToParse(what);

        // For now only support !SetAtt
        if (!message.startsWith('!SetAtt[')) {
            return Promise.reject('Currently only supports actions that start with !SetAtt');
        } else {

            // console.log(tag, JSON.stringify(message.split('!SetAtt['), null, 2));
            // console.log(tag, JSON.stringify(message.split(']'), null, 2));

            // console.log(tag, JSON.stringify(message.split('!'), null, 2));

            let backwardBracketOccurences = message.split(']');

            console.log(_.flatten(backwardBracketOccurences.map(backwardBracketContent => {
                return backwardBracketContent.split('[');
            })));

            return Promise.resolve('');
        }

    }


}

module.exports = BlueprintParser;
