import gql from 'graphql-tag';

export default gql`
    query GetDeviceStats {
        getDeviceStats {
            total
            connected
            disconnected
        }
    }
`;
