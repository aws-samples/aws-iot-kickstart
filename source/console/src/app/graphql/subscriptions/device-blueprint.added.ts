import gql from 'graphql-tag';

export default gql`
    subscription AddedDeviceBlueprint {
        addedDeviceBlueprint {
            id
            name
            type
            compatibility
            deviceTypeMappings
            spec
            createdAt
            updatedAt
        }
    }
`;
