import gql from 'graphql-tag';

export default gql`
    mutation AddDeviceType(
        $name: String!
        $type: String!
        $spec: AWSJSON
    ) {
        addDeviceType(
            name: $name
            type: $type
            spec: $spec
        ) {
            id
            name
            type
            spec
            createdAt
            updatedAt
        }
    }
`;
