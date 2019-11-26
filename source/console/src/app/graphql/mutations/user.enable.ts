import gql from 'graphql-tag';

export default gql`
    mutation EnableUser($username: String!) {
        enableUser(username: $username) {
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
