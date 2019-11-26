// TODO: we probably need to check that the key alreay exists and then overwrite instead of concat !

// Child gets pushed INTO Parent BUT Parent always wins.
// Example: Devcice INTO DeviceType
function extend(parent, child, type) { //parentKey, childKey, on) {

    let result = parent;

    const tag = 'extend(' + type + '):';
    const parentKey = type + 'DefinitionVersion';
    const childKey = type + 's';

    console.log(tag, 'start');

    if (['Core', 'Device', 'Function', 'Logger', 'Resource', 'Subscription', 'Connector'].indexOf(type) === -1) {
        console.log(tag, 'provided type', type, 'is not something this supports yet');
    } else {


        if (child.hasOwnProperty(parentKey) && child[parentKey].hasOwnProperty(childKey)) {

            // ex: device.CoreDefinitionVersion exists AND child.CoreDefinitionVersion.Cores also exists.
            console.log(tag, 'child.' + parentKey, 'exists, AND child.' + parentKey + '.' + childKey + 'also exists. ie. child has the desired keys');

            if (!result.hasOwnProperty(parentKey) || !result[parentKey].hasOwnProperty(childKey)) {
                // ex: deviceType.CoreDefinitionVersion does not exist OR deviceType.CoreDefinitionVersion.Cores also does not exist.
                console.log(tag, 'parent.' + parentKey, 'doesnt exist OR parent.' + parentKey + '.' + childKey + 'doesnt exist. ie. parent does not have the desired keys.');
                result[parentKey] = {};
                result[parentKey][childKey] = [];
            }

            // For Core, Function, Resource and Device we will check. For the others, we simply concat (ie. add them)
            switch (type) {
                case 'Core':
                    // There can only be 1 Core device. So in this case, it's simple. We simply overwrite.
                    if (child[parentKey][childKey].length === 1 && result[parentKey][childKey].length === 0) {
                        result[parentKey][childKey] = child[parentKey][childKey];
                    } else {
                        // Do nothing cause this means that child either doesnt have any cores, or that the template has too many, and that's not good. Skip
                    }
                    break;
                case 'Device':
                    child[parentKey][childKey].forEach(subChild => {
                        if (result[parentKey][childKey].findIndex(subParent => {
                                return subParent.ThingArn === subChild.ThingArn;
                            }) === -1) {
                            result[parentKey][childKey] = [...result[parentKey][childKey], subChild];
                        }
                    });
                    break;
                case 'Function':
                    child[parentKey][childKey].forEach(subChild => {
                        if (result[parentKey][childKey].findIndex(subParent => {
                                return subParent.FunctionArn === subChild.FunctionArn;
                            }) === -1) {
                            result[parentKey][childKey] = [...result[parentKey][childKey], subChild];
                        }
                    });
                    break;
                case 'Resource':
                    child[parentKey][childKey].forEach(subChild => {
                        if (result[parentKey][childKey].findIndex(subParent => {
                                return subParent.Id === subChild.Id;
                            }) === -1) {
                            result[parentKey][childKey] = [...result[parentKey][childKey], subChild];
                        }
                    });
                    break;
                case 'Connector':
                    child[parentKey][childKey].forEach(subChild => {
                        if (result[parentKey][childKey].findIndex(subParent => {
                                return subParent.ConnectorArn === subChild.ConnectorArn;
                            }) === -1) {
                            result[parentKey][childKey] = [...result[parentKey][childKey], subChild];
                        }
                    });
                    break;
                default:
                    // Simply concat
                    result[parentKey][childKey] = [...result[parentKey][childKey], ...child[parentKey][childKey]];
                    break;
            }

            console.log(tag, result[parentKey][childKey]);

        }
    }

    return result;
}

module.exports = function (parent, child) {
    // "CoreDefinitionVersion": "Cores": [
    // "FunctionDefinitionVersion": "Functions": [
    // "LoggerDefinitionVersion": "Loggers": [
    // "SubscriptionDefinitionVersion": "Subscriptions": [
    // "ResourceDefinitionVersion": "Resources": [

    let result = parent;
    result = extend(result, child, 'Core'); //'CoreDefinitionVersion', 'Cores', 'ThingArn');
    result = extend(result, child, 'Function'); //'FunctionDefinitionVersion', 'Functions', 'FunctionArn');
    result = extend(result, child, 'Logger'); //'LoggerDefinitionVersion', 'Loggers');
    result = extend(result, child, 'Subscription'); //'SubscriptionDefinitionVersion', 'Subscriptions');
    result = extend(result, child, 'Resource'); //'ResourceDefinitionVersion', 'Resources');
    result = extend(result, child, 'Device'); //'DeviceDefinitionVersion', 'Devices');
    result = extend(result, child, 'Connector');
    return result;
};
