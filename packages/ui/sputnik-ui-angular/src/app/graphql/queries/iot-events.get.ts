import gql from 'graphql-tag'

export default gql`
		query GetIoTEvents($namespace: String!, $deviceId: String!) {
				getEvents(namespace: $namespace, deviceId: $deviceId) {
						namespace
						deviceId
						events {
								namespace
								deviceId
								deviceIdTimestamp
								timestamp
								expiresAt
								data
						}
				}
		}
`
