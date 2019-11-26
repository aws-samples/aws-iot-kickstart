import gql from 'graphql-tag';

export default gql`
    query GetThingShadow($params: AWSJSON!) {
        getThingShadow(params: $params) {
            payload
        }
    }
`;
