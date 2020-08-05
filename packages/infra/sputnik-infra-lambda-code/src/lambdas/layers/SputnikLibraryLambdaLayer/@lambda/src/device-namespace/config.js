export default {
	defaultNamespace: process.env.DEFAULT_NAMESPACE || 'default',
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	sessionToken: process.env.AWS_SESSION_TOKEN,
	graphQlEndpoint: process.env.GRAPHQL_ENDPOINT,
	region: process.env.AWS_REGION,
}
