import gql from 'graphql-tag';

export default gql`
    subscription UpdatedSystem {
        updatedSystem {
            id
            deviceIds
            name
            systemBlueprintId
            createdAt
            updatedAt
        }
    }
`;
