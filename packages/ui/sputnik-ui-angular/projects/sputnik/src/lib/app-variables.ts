
interface AppVariables {
	REGION: string
	IOT_ENDPOINT: string
	S3_DATA_BUCKET: string
	IDENTITY_POOL_ID: string
	USER_POOL_ID: string
	USER_POOL_CLIENT_ID: string
	IOT_COGNITO_POLICY: string
	APP_SYNC_GRAPHQL_ENDPOINT: string
}

declare global {
	const appVariables: AppVariables
}

export default appVariables

export const REGION = appVariables.REGION
export const IOT_ENDPOINT = appVariables.IOT_ENDPOINT
export const S3_DATA_BUCKET = appVariables.S3_DATA_BUCKET
export const IDENTITY_POOL_ID = appVariables.IDENTITY_POOL_ID
export const USER_POOL_ID = appVariables.USER_POOL_ID
export const USER_POOL_CLIENT_ID = appVariables.USER_POOL_CLIENT_ID
export const IOT_COGNITO_POLICY = appVariables.IOT_COGNITO_POLICY
export const APP_SYNC_GRAPHQL_ENDPOINT = appVariables.APP_SYNC_GRAPHQL_ENDPOINT
