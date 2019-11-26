import gql from 'graphql-tag';

export default gql`
    mutation DeleteSystem($id: String!) {
        deleteSystem(id: $id) {
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
