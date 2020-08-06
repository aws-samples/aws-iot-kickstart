import { ITypedef } from 'graphql-tools'
// @ts-ignore
import { convertSchemas, AppSyncDirectives } from 'appsync-schema-converter'
import { RootSchemaConfig, RootTypeConfig } from './root-schema-config'

// Directive pulled from https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/547#issuecomment-610671519
const APPSYNC_DIRECTIVES = [
	'directive @aws_auth(cognito_groups: [String]) on FIELD_DEFINITION',
	'directive @aws_cognito_user_pools(cognito_groups: [String]) on OBJECT | FIELD_DEFINITION',
	'directive @aws_iam on OBJECT | FIELD_DEFINITION',
	'directive @aws_api_key on OBJECT | FIELD_DEFINITION',
	'directive @aws_oidc on OBJECT | FIELD_DEFINITION',
	'directive @aws_publish(subscriptions: [String]) on FIELD_DEFINITION',
	'directive @aws_subscribe(mutations: [String]) on FIELD_DEFINITION',
]

// AppSyncDirectives is incorrect: https://gitlab.com/vicary/appsync-schema-converter/-/blob/master/index.js#L17
AppSyncDirectives.splice(0, AppSyncDirectives.length, ...APPSYNC_DIRECTIVES)

const ROOT_TMP_FIELD = '__tmp_root_field__'

function createRootType (type: string, config?: RootTypeConfig | boolean): string {
	if (config == null || config === false) {
		return ''
	}

	return `type Query ${(config as RootTypeConfig).directives || ''} { ${ROOT_TMP_FIELD}: String }`
}

function createRootSchema (config?: RootSchemaConfig): string {
	return `
	${createRootType('Query', config?.Query)}
	${createRootType('Mutation', config?.Mutation)}
	${createRootType('Subscription', config?.Subscription)}

	schema {
	query: Query
	mutation: Mutation
	subscription: Subscription
	}
	`
}

export function printSchema (config?: RootSchemaConfig, ...typeDefs: ITypedef[]): string {
	const rootSchema = createRootSchema(config)

	let schema = convertSchemas([rootSchema, ...typeDefs], { commentDescriptions: true, includeDirectives: true })

	// Clean up temps
	schema = schema.replace(new RegExp(`\\s*${ROOT_TMP_FIELD}: String\\s*`, 'g'), '').trim()

	// Remove extra whitespace
	schema = schema.replace(/\n{3,}/g, '\n\n').trim()

	return schema
}
