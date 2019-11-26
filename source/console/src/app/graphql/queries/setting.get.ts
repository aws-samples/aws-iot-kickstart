import gql from 'graphql-tag';

export default gql`
    query GetSetting($id: String!) {
        getSetting(id: $id) {
            id
            type
            setting
            createdAt
            updatedAt
        }
    }
`;
