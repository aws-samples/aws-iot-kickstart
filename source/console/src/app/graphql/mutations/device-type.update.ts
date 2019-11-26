import gql from 'graphql-tag';

export default gql`
    mutation UpdateDeviceType(
        $id: String!
        $name: String!
        $type: String!
        $spec: AWSJSON
    ) {
        updateDeviceType(
            id: $id
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
