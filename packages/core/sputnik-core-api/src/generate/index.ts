import * as fs from 'fs'
import * as path from 'path'
import { printSchema } from './print-schema'
import typeDefs from './type-defs'
import { RootSchemaConfig } from './root-schema-config'

const OUTPUT_DIR = path.join(__dirname, '../../lib')
const SCHEMA_FILE = path.join(OUTPUT_DIR, 'schema.graphql')

export default () => {
	const config: RootSchemaConfig = {
		Mutation: {
			directives: '@aws_iam @aws_cognito_user_pools(cognito_groups: ["Administrators", "Members"])',
		},
		Query: {
			directives: '@aws_iam @aws_cognito_user_pools(cognito_groups: ["Administrators", "Members"])',
		},
		Subscription: {
			directives: '@aws_iam @aws_cognito_user_pools(cognito_groups: ["Administrators", "Members"])',
		},
	}
	fs.mkdirSync(OUTPUT_DIR, { recursive: true })

	const schema = printSchema(config, ...typeDefs)
	fs.writeFile(SCHEMA_FILE, schema, { encoding: 'utf-8' }, () => {
		console.info(`Success generated ${SCHEMA_FILE}`)
	})
}
