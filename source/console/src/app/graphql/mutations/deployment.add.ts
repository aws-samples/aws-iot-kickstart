import gql from 'graphql-tag';

export default gql`
    mutation AddDeployment($thingId: String!) {
        addDeployment(thingId: $thingId) {
            thingId
            deploymentId
            type
            spec
            greengrassGroup
            createdAt
            updatedAt
        }
    }
`;
