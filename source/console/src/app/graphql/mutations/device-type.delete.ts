import gql from 'graphql-tag';

export default gql`
    mutation DeleteDeviceType(
        $id: String!
    ) {
        deleteDeviceType(
            id: $id
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
