const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const gg = new AWS.Greengrass();
const _ = require('underscore');

function _recursiveListGroups(nextToken) {
    return gg.listGroups({
        MaxResults: '1',
        NextToken: nextToken
    }).promise().then(groups => {
        let _groups = groups.Groups;
        if (groups.NextToken) {
            return _recursiveListGroups(groups.NextToken).then(grps => {
                return _groups.concat(grps);
            });
        } else {
            return _groups;
        }
    });
}


module.exports = function listGreengrassGroupIdsForThingArn(thingArn) {

    const tag = 'listGreengrassGroupsForThingArn: ' + thingArn + ': ';

    return _recursiveListGroups().then(groups => {
        console.log(tag, 'Found following greengrass groups:', groups);

        return Promise.all(groups.map(group => {
            if (group.LatestVersion) {
                return gg.getGroupVersion({
                    GroupId: group.Id,
                    GroupVersionId: group.LatestVersion
                }).promise().then(groupVersion => {
                    if (groupVersion && groupVersion.Definition && groupVersion.Definition.CoreDefinitionVersionArn) {
                        return gg.getCoreDefinitionVersion({
                            CoreDefinitionId: groupVersion.Definition.CoreDefinitionVersionArn.split('/')[4],
                            CoreDefinitionVersionId: groupVersion.Definition.CoreDefinitionVersionArn.split('/')[6]
                        }).promise();
                    } else {
                        return null;
                    }
                }).then(coreDefinitionVersion => {
                    if (coreDefinitionVersion && coreDefinitionVersion.Definition &&
                        coreDefinitionVersion.Definition.Cores && coreDefinitionVersion.Definition.Cores[0] && coreDefinitionVersion.Definition.Cores[0].ThingArn) {
                        if (coreDefinitionVersion.Definition.Cores[0].ThingArn === thingArn) {
                            return group.Id;
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                });
            } else {
                return null;
            }
        }));

    }).then(groupIds => {
        return _.filter(groupIds, gId => {
            return gId !== null;
        });
    });

};
