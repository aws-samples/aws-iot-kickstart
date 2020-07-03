import gql from 'graphql-tag'

export default gql`
    mutation AddTenant($name: String!) {
        addTenant(name: $name) {
            tenant
            group {
                GroupName
                UserPoolId
                Description
                RoleArn
                Precedence
                LastModifiedDate
                CreationDate
            }
        }
    }
`
