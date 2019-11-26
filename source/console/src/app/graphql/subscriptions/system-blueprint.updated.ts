import gql from 'graphql-tag';

export default gql`
    subscription UpdatedSystemBlueprint {
        updatedSystemBlueprint {
            id
            name
            description
            spec
            createdAt
            updatedAt
        }
    }
`;
