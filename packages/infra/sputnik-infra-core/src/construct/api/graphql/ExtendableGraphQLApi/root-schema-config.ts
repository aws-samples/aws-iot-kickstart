export interface RootTypeConfig {
	readonly directives?: string
}

export interface RootSchemaConfig {
	readonly Query?: RootTypeConfig | boolean
	readonly Mutation?: RootTypeConfig | boolean
	readonly Subscription?: RootTypeConfig | boolean
}
