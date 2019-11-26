import gql from 'graphql-tag';

export default gql`
    query ListUsers($limit: Int, $paginationToken: String) {
        listUsers(limit: $limit, paginationToken: $paginationToken) {
            Users {
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
            PaginationToken
        }
    }
`;
