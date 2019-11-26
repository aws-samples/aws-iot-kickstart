import gql from 'graphql-tag';

export default gql`
    query ListDevicesWithDeviceBlueprint($deviceBlueprintId: String!, $limit: Int, $nextToken: String) {
        listDevicesWithDeviceBlueprint(deviceBlueprintId: $deviceBlueprintId, limit: $limit, nextToken: $nextToken) {
            devices {
                thingId
                thingName
                thingArn
                name
                deviceTypeId
                deviceBlueprintId
            }
            nextToken
        }
    }
`;
