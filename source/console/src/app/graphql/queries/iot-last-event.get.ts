import gql from 'graphql-tag'

export default gql`
    query GetLastIoTEvents($namespace: String!, $deviceId: String!) {
        getLastEvent(namespace: $namespace, deviceId: $deviceId) {
            namespace
            deviceId
            deviceIdTimestamp
            timestamp
            expiresAt
            data
        }
    }
`
