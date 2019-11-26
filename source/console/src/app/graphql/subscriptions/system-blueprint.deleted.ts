import gql from 'graphql-tag';

export default gql`
    subscription DeletedSystemBlueprint {
        deletedSystemBlueprint {
            id
            name
            description
            spec
            createdAt
            updatedAt
        }
    }
`;
