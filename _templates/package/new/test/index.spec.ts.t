---
to: <%= packageDir %>/test/index.spec.ts
---
import <%= h.changeCase.camel(name) %> from '../src'

describe('<%= packageName %>', () => {
	test('TODO: write tests!', () => {
		expect(<%= h.changeCase.camel(name) %>).toBeDefined()
	})
})
