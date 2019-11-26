import gql from 'graphql-tag';

export default gql`
    mutation DeleteDeviceBlueprint($id: String!) {
        deleteDeviceBlueprint(id: $id) {
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
