import gql from 'graphql-tag';

export default gql`
    query ListDevicesOfDeviceType($deviceTypeId: String!, $limit: Int, $nextToken: String) {
        listDevicesOfDeviceType(deviceTypeId: $deviceTypeId, limit: $limit, nextToken: $nextToken) {
            devices {
                thingId
                thingName
                thingArn
                name
                deviceTypeId
                deviceBlueprintId
                connectionState {
                    state
                    at
                }
                spec
                greengrassGroupId
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
