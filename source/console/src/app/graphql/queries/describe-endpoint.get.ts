import gql from 'graphql-tag';

export default gql`
    query DescribeEndpoint($endpointType: String) {
        describeEndpoint(endpointType: $endpointType)
    }
`;
