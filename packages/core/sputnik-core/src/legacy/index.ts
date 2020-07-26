import * as path from 'path'

export const LEGACY_DIR = path.resolve(__dirname, '../../../../../', 'legacy')

export function getLegacyPath (file: string): string {
	return path.join(LEGACY_DIR, file)
}

export function getLegacyLambdaPath (file: string): string {
	return path.join(LEGACY_DIR, 'lambdas', file)
}
