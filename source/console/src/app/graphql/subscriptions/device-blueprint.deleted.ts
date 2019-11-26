import gql from 'graphql-tag';

export default gql`
    subscription DeletedDeviceBlueprint {
        deletedDeviceBlueprint {
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
