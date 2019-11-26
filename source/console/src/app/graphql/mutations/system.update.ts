import gql from 'graphql-tag';

export default gql`
    mutation UpdateSystem($id: String!, $name: String!, $description: String, $deviceIds: [String]!) {
        updateSystem(id: $id, name: $name, description: $description, deviceIds: $deviceIds) {
            id
            name
            description
            deviceIds
            systemBlueprintId
            createdAt
            updatedAt
        }
    }
`;
