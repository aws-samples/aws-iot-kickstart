import gql from 'graphql-tag';

export default gql`
    subscription AddedSystem {
        addedSystem {
            id
            deviceIds
            name
            systemBlueprintId
            createdAt
            updatedAt
        }
    }
`;
