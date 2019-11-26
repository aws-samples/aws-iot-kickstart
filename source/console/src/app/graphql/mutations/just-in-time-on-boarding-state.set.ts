import gql from 'graphql-tag';

export default gql`
    mutation SetJustInTimeOnBoardingState($enabled: Boolean!) {
        setJustInTimeOnBoardingState(enabled: $enabled)
    }
`;
