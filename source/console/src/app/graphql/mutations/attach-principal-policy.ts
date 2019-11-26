import gql from 'graphql-tag';

export default gql`
    mutation AttachPrincipalPolicy($policyName: String!, $principal: String!) {
        attachPrincipalPolicy(policyName: $policyName, principal: $principal)
    }
`;
