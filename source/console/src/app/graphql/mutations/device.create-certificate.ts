import gql from 'graphql-tag';

export default gql`
    mutation CreateCertificate($thingId: String!, $csr: String!) {
        createCertificate(thingId: $thingId, csr: $csr) {
            certificateArn
            certificateId
            certificatePem
        }
    }
`;
