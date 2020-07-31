interface Environment {
	readonly production: boolean
	readonly appName: string
	readonly appVersion: string
	readonly isDebugMode: boolean
	readonly refreshInterval: number
}

const environment: Environment = {
	production: false,
	appName: 'sputnik',
	appVersion: '0.0.1',
	isDebugMode: true,
	refreshInterval: 30000,
}

export function setEnvironment (env: Partial<Environment>, prod?: boolean): void {
	if (prod) {
		Object.assign(environment, {
			production: true,
			isDebugMode: false,
		})
	}
	Object.assign(environment, env)
}

export function getEnvironment (): Environment {
	return environment
}
