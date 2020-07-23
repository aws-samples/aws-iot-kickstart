---
to: "<%= type != 'flat' ? null : `${packageDir}/__test__/index.spec.ts` %>"
---
import <%= h.changeCase.camel(name) %> from '../'

describe('<%= packageName %>', () => {
	test('TODO: write tests!', () => {
		expect(<%= h.changeCase.camel(name) %>).toBeDefined()
	})
})
