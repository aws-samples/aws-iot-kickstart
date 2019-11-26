import gql from 'graphql-tag';

export default gql`
    subscription AddedDeviceType {
        addedDeviceType {
            id
            name
            type
            spec
            createdAt
            updatedAt
        }
    }
`;
