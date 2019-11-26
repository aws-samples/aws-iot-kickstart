import gql from 'graphql-tag';

export default gql`
    mutation UpdateSetting($id: String!, $type: String!, $setting: AWSJSON!) {
        updateSetting(id: $id, type: $type, setting: $setting) {
            id
            type
            setting
            createdAt
            updatedAt
        }
    }
`;
