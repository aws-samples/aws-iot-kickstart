import gql from 'graphql-tag';

export default gql`
    mutation InviteUser($name: String!, $email: String!, $groups: AWSJSON!) {
        inviteUser(name: $name, email: $email, groups: $groups)
    }
`;
