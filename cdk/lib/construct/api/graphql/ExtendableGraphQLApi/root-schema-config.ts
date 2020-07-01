export interface RootTypeConfig {
	readonly directives?: string
}

export interface RootSchemaConfig {
	readonly Query?: RootTypeConfig
	readonly Mutation?: RootTypeConfig
	readonly Subscription?: RootTypeConfig
}
