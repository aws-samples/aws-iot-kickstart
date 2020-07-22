/* eslint-disable @typescript-eslint/no-var-requires */
import * as path from 'path'
import { init as initStorage, getItem, setItem } from 'node-persist'
import findup = require('find-up')

async function initStore (): Promise<void> {
	await initStorage({
		dir: path.resolve(await findup('.git', { type: 'directory' }) as string, '../', '.cache/prompts'),
	})
}

interface Values {
	[key: string]: any
}

export const getPromptStoreValues = async (key: string): Promise<Values> => {
	try {
		await initStore()

		return (await getItem(key)) || {}
	} catch (error) {
		console.warn('Failed to get stored values', error)

		return {}
	}
}

export const setPromptStoreValues = async (key: string, values: Values): Promise<void> => {
	try {
		await initStore()

		await setItem(key, values)
	} catch (error) {
		console.log('Failed to store values', error)
	}
}
