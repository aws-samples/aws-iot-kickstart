import gql from 'graphql-tag';

export default gql`
    query GetSystem($id: String!) {
        getSystem(id: $id) {
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
