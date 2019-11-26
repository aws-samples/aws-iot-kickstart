import gql from 'graphql-tag';

export default gql`
    query ListSystemBlueprints($limit: Int, $nextToken: String) {
        listSystemBlueprints(limit: $limit, nextToken: $nextToken) {
            systemBlueprints {
                id
                name
                description
                prefix
                spec
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
