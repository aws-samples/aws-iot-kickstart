import gql from 'graphql-tag';

export default gql`
    query GetDeviceType($id: String!) {
        getDeviceType(id: $id) {
            id
            name
            type
            spec
            createdAt
            updatedAt
        }
    }
`;
