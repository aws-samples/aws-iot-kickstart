import gql from 'graphql-tag'

export default gql`
		query ListUsers($limit: Int, $nextToken: String) {
				listUsers(limit: $limit, nextToken: $nextToken) {
						users {
								user_id
								name
								email
								enabled
								groups {
										name
										_state
								}
								status
								created_at
								updated_at
						}
						nextToken
				}
		}
`
