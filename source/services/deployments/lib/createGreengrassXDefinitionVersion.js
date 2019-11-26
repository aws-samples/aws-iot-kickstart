const AWS = require('aws-sdk');
const gg = new AWS.Greengrass();
const _ = require('underscore');
const uuid = require('uuid');

const diff = require('deep-diff').diff;

module.exports = function (key, spec, currentGreengrassGroupDefinitionVersion) {

    const tag = 'createGreengrass' + key + 'DefinitionVersion:';
    console.log(tag);

    // Simple version: We'll just create it rather than check.
    if (!spec.hasOwnProperty(key + 'DefinitionVersion')) {
        console.log(tag, key + 'DefinitionVersion not found in spec. Returning.');
        return Promise.resolve(null);
    } else {

        let promise;

        if (!currentGreengrassGroupDefinitionVersion || !currentGreengrassGroupDefinitionVersion.Definition[key + 'DefinitionVersionArn']) {
            console.log(tag, key + 'DefinitionVersion needs creating');
            promise = gg['create' + key + 'Definition']({
                Name: uuid.v4()
            }).promise();
        } else {
            console.log(tag, key + 'DefinitionVersion exists', currentGreengrassGroupDefinitionVersion);
            let params = {};
            params[key + 'DefinitionId'] = currentGreengrassGroupDefinitionVersion.Definition[key + 'DefinitionVersionArn'].split('/')[4];
            promise = gg['get' + key + 'Definition'](params).promise();
        }

        return promise.then(definition => {
            console.log('Using definition Id', definition.Id, definition);
            let params = {};
            params[key + 'DefinitionId'] = definition.Id;

            if (definition.hasOwnProperty('LatestVersion')) {

                // This means that it already exists. Then lets remove the Ids and stringify to compare with the spec.

                console.log(tag, 'Definition already exists, lets remove the Ids and compare');

                params[key + 'DefinitionVersionId'] = definition.LatestVersion;

                return gg['get' + key + 'DefinitionVersion'](params).promise().then(definitionVersion => {

                    delete params[key + 'DefinitionVersionId'];

                    let originalToCompare = definitionVersion.Definition[key + 's'];

                    spec[key + 'DefinitionVersion'][key + 's'].forEach(o => {
                        if (!o.hasOwnProperty('Id')) {
                            o.Id = uuid.v4();
                        }
                    });

                    params[key + 's'] = spec[key + 'DefinitionVersion'][key + 's'];
                    return gg['create' + key + 'DefinitionVersion'](params).promise().then(tempVersion => {
                        delete params[key + 's'];
                        params[key + 'DefinitionVersionId'] = tempVersion.Version;
                        return gg['get' + key + 'DefinitionVersion'](params).promise().then(tempFullVersion => {
                            console.log(tag, tempFullVersion);
                            let newToCompare = tempFullVersion.Definition[key + 's'];
                            console.log(tag, 'Removing all Ids from original:', originalToCompare);
                            originalToCompare.forEach(item => {
                                delete item.Id;
                            });
                            console.log(tag, 'Removing all Ids from new:', newToCompare);
                            newToCompare.forEach(item => {
                                delete item.Id;
                            });
                            console.log(tag, 'Compare:', JSON.stringify(originalToCompare), JSON.stringify(newToCompare));

                            if (diff(originalToCompare, newToCompare)) {
                                console.log(tag, 'Its different, stick to the new');
                                return tempFullVersion;
                            } else {
                                console.log(tag, 'Its same, stick to the old');
                                return definitionVersion;
                            }
                        });
                    });



                    // let newToCompare = JSON.parse(JSON.stringify(spec[key + 'DefinitionVersion'][key + 's']));

                    // console.log(tag, 'Removing all Ids from original:', originalToCompare);
                    // originalToCompare.forEach(item => {
                    //     delete item.Id;
                    // });
                    // console.log(tag, 'Removing all Ids from new:', newToCompare);
                    // newToCompare.forEach(item => {
                    //     delete item.Id;
                    // });

                    // console.log(tag, 'Ids removed: Comparing:', JSON.stringify(originalToCompare), JSON.stringify(newToCompare));

                    // if (diff(originalToCompare, newToCompare)) {

                    //     console.log(tag, 'Its different: build the Ids and create the DefinitionVersion');
                    //     spec[key + 'DefinitionVersion'][key + 's'].forEach(o => {
                    //         if (!o.hasOwnProperty('Id')) {
                    //             o.Id = uuid.v4();
                    //         }
                    //     });

                    //     params[key + 's'] = spec[key + 'DefinitionVersion'][key + 's'];
                    //     return gg['create' + key + 'DefinitionVersion'](params).promise();

                    // } else {
                    //     // They are the same: don't do anything !
                    //     console.log(tag, 'Its the same, return the definition version as is', definitionVersion);
                    //     return definitionVersion;
                    // }

                });
            } else {
                // Simple, doesnt exist, so lets create.

                console.log(tag, 'Definition doesnt exist: build the Ids and create the DefinitionVersion');

                spec[key + 'DefinitionVersion'][key + 's'].forEach(o => {
                    if (!o.hasOwnProperty('Id')) {
                        o.Id = uuid.v4();
                    }
                });

                params[key + 's'] = spec[key + 'DefinitionVersion'][key + 's'];
                console.log(tag, 'create' + key + 'DefinitionVersion:', params, 'for', spec);
                return gg['create' + key + 'DefinitionVersion'](params).promise();
            }
        }).then(result => {
            console.log(tag, 'result', JSON.stringify(result));
            return result;
        });

    }

};
