import gql from 'graphql-tag';

export default gql`
    query GetSystemBlueprint($id: String!) {
        getSystemBlueprint(id: $id) {
            id
            name
            description
            prefix
            spec
            createdAt
            updatedAt
        }
    }
`;
