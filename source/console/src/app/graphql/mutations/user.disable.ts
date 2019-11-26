import gql from 'graphql-tag';

export default gql`
    mutation DisableUser($username: String!) {
        disableUser(username: $username) {
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
    }
`;
