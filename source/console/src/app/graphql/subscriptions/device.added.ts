import gql from 'graphql-tag';

export default gql`
    subscription AddedDevice {
        addedDevice {
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
