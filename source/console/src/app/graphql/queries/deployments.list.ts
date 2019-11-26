import gql from 'graphql-tag';

export default gql`
    query ListDeployments($limit: Int, $nextToken: String) {
        listDeployments(limit: $limit, nextToken: $nextToken) {
            deployments {
                thingId
                deploymentId
                type
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
