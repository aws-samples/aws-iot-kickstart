import gql from 'graphql-tag';

export default gql`
    mutation UpdateThingShadow($params: AWSJSON!) {
        updateThingShadow(params: $params) {
            payload
        }
    }
`;
