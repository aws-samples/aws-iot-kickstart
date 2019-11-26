import gql from 'graphql-tag';

export default gql`
    query GetData($thingName: String!, $metricName: String!, $timeAgoInSecs: Int!) {
        getData(thingName: $thingName, metricName: $metricName, timeAgoInSecs: $timeAgoInSecs) {
            Data {
                ThingNameAndMetric
                Timestamp
                Data
            }
        }
    }
`;
