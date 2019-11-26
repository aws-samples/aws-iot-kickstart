import gql from 'graphql-tag';

export default gql`
    mutation UpdateUser($username: String!, $groups: AWSJSON!) {
        updateUser(username: $username, groups: $groups) {
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
