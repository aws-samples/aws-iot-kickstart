import gql from 'graphql-tag';

export default gql`
    query S3ListObjectsV2($params: AWSJSON!) {
        s3ListObjectsV2(params: $params) {
            Contents {
                Key
            }
            KeyCount
            NextContinuationToken
            IsTruncated
        }
    }
`;
