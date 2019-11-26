import gql from 'graphql-tag';

export default gql`
    query ListDeviceBlueprints($limit: Int, $nextToken: String) {
        listDeviceBlueprints(limit: $limit, nextToken: $nextToken) {
            deviceBlueprints {
                id
                name
                type
                compatibility
                deviceTypeMappings
                spec
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
