import gql from 'graphql-tag';

export default gql`
    subscription AddedSystemBlueprint {
        addedSystemBlueprint {
            id
            name
            description
            spec
            createdAt
            updatedAt
        }
    }
`;
