import gql from 'graphql-tag';

export default gql`
    subscription UpdatedDeviceBlueprint {
        updatedDeviceBlueprint {
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
