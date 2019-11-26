import gql from 'graphql-tag';

export default gql`
    mutation AddSystem($name: String!, $description: String, $deviceIds: [String]!, $systemBlueprintId: String!) {
        addSystem(
            name: $name
            description: $description
            deviceIds: $deviceIds
            systemBlueprintId: $systemBlueprintId
        ) {
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
