import gql from 'graphql-tag';

export default gql`
    query GetDeviceBlueprint($id: String!) {
        getDeviceBlueprint(id: $id) {
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
