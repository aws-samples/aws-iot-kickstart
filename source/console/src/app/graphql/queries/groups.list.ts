import gql from 'graphql-tag';

export default gql`
    query ListGroups($limit: Int, $nextToken: String) {
        listGroups(limit: $limit, nextToken: $nextToken) {
            Groups {
                GroupName
                UserPoolId
                Description
                RoleArn
                Precedence
                LastModifiedDate
                CreationDate
            }
            NextToken
        }
    }
`;
