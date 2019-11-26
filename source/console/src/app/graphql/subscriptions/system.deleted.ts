import gql from 'graphql-tag';

export default gql`
    subscription DeletedSystem {
        deletedSystem {
            id
            deviceIds
            name
            systemBlueprintId
            createdAt
            updatedAt
        }
    }
`;
