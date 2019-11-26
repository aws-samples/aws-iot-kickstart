import gql from 'graphql-tag';

export default gql`
    query GetSystemStats {
        getSystemStats {
            total
        }
    }
`;
