import gql from 'graphql-tag';

export default gql`
    mutation AddDevice(
        $name: String!
        $deviceTypeId: String!
        $deviceBlueprintId: String!
    ) {
        addDevice(
            name: $name
            deviceTypeId: $deviceTypeId
            deviceBlueprintId: $deviceBlueprintId
        ) {
            thingId
            thingName
            thingArn
            name
            deviceTypeId
            deviceBlueprintId
            greengrassGroupId
            spec
            lastDeploymentId
            createdAt
            updatedAt
        }
    }
`;
