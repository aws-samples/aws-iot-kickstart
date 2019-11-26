import gql from 'graphql-tag';

export default gql`
    mutation AddSystemBlueprint($name: String!, $description: String, $prefix: String!, $spec: AWSJSON!) {
        addSystemBlueprint(
            name: $name
            description: $description
            prefix: $prefix
            spec: $spec
        ) {
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
