import gql from 'graphql-tag';

export default gql`
    mutation DeleteDevice($thingId: String!) {
        deleteDevice(thingId: $thingId) {
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
