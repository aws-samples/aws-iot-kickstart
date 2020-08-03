import gql from 'graphql-tag'

export default gql`
		query ListGroups($limit: Int, $nextToken: String) {
				listGroups(limit: $limit, nextToken: $nextToken) {
						groups {
								GroupName
								UserPoolId
								Description
								RoleArn
								Precedence
								LastModifiedDate
								CreationDate
						}
						nextToken
				}
		}
`
