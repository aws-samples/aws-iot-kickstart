import * as fs from 'fs'
import * as path from 'path'

function getTypeDef (name: string): string {
	return fs.readFileSync(path.join(__dirname, '..', 'schema', `${name}.graphql`), { encoding: 'utf-8' })
}

const typeDefs = [
	'common',
	'pagination',
	'setting',
	'admin',
	'device-type',
	'device-blueprint',
	'device',
	'system-blueprint',
	'system',
	'iot',
	'deployment',
	'jit',
	'utils',
	'greengrass',
	'spec',
]

export default typeDefs.map(name => getTypeDef(name))
