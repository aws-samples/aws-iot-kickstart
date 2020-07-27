import gql from 'graphql-tag'

export default gql`
	subscription AddedTenant {
	addedTenant {
	tenant
	group {
	GroupName
	UserPoolId
	Description
	RoleArn
	Precedence
	LastModifiedDate
	CreationDate
	}
	}
	}
`
