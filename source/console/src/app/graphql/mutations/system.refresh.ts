import gql from 'graphql-tag';

export default gql`
    mutation RefreshSystem($id: String!) {
        refreshSystem(id: $id)
    }
`;
