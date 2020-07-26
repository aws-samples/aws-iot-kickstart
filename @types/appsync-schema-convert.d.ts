declare module 'appsync-schema-converter' {
	import { ITypedef } from 'graphql-tools'

	interface PrintSchemaOptions {
		readonly commentDescriptions?: boolean
		readonly includeDirectives?: boolean
	}

	export function printSchema(schemas: (string|ITypedef)[], options?: PrintSchemaOptions): string

	export function convertSchemas(schemas: (string|ITypedef)[], options?: PrintSchemaOptions): string

	export const AppSyncScalars: string[]
	export const AppSyncDirectives: string[]
}
