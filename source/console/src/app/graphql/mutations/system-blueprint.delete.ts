import gql from 'graphql-tag';

export default gql`
    mutation DeleteSystemBlueprint($id: String!) {
        deleteSystemBlueprint(id: $id) {
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
