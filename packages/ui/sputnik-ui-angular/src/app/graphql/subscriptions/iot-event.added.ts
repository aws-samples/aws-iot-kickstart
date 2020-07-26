import gql from 'graphql-tag'

export default gql`
	subscription AddedIoTEvent {
	addedEvent {
	namespace
	deviceId
	deviceIdTimestamp
	timestamp
	expiresAt
	data
	}
	}
`
