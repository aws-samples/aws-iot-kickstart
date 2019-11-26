import gql from 'graphql-tag';

export default gql`
    query ListSystems($limit: Int, $nextToken: String) {
        listSystems(limit: $limit, nextToken: $nextToken) {
            systems {
                id
                name
                description
                deviceIds
                systemBlueprintId
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
