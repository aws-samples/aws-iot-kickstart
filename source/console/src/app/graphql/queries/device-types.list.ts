import gql from 'graphql-tag';

export default gql`
    query ListDeviceTypes($limit: Int, $nextToken: String) {
        listDeviceTypes(limit: $limit, nextToken: $nextToken) {
            deviceTypes {
                id
                name
                type
                spec
                createdAt
                updatedAt
            }
            nextToken
        }
    }
`;
