import { Construct } from '@aws-cdk/core'
import { readFileSync } from 'fs'
import { extname } from 'path'
import { yamlParse } from 'yaml-cfn'

export function parseTemplate (file: string): any {
	if (['yml', 'yaml'].includes(extname(file))) {
		return yamlParse(readFileSync(file).toString())
	} else {
		throw new Error('Only supports YAML files')
	}
}

export function mapContextToParameters (template: any, scope: Construct): void {
	Object.keys(template.Parameters).forEach((key): void => {
		const value = scope.node.tryGetContext(key)

		if (value != null) {
			template.Parameters[key].Default = value
		}
	})
}

export function mapPropsToParameters (template: any, props: any): void {
	Object.keys(template.Parameters).forEach((key): void => {
		if (key in props) {
			template.Parameters[key].Default = props[key]
		}
	})
}
