import gql from 'graphql-tag';

export default gql`
    subscription UpdatedDeviceType {
        updatedDeviceType {
            id
            name
            type
            spec
            createdAt
            updatedAt
        }
    }
`;
