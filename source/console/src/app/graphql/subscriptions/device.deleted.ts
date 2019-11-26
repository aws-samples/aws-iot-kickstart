import gql from 'graphql-tag';

export default gql`
    subscription DeletedDevice {
        deletedDevice {
            thingId
            thingName
            deviceTypeId
            deviceBlueprintId
            connectionState {
                state
                at
            }
            greengrassGroupId
            lastDeploymentId
            createdAt
            updatedAt
        }
    }
`;
