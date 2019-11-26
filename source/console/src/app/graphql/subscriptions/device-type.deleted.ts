import gql from 'graphql-tag';

export default gql`
    subscription DeletedDeviceType {
        deletedDeviceType {
            id
            name
            type
            spec
            createdAt
            updatedAt
        }
    }
`;
