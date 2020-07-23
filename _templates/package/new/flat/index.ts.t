---
to: "<%= type != 'flat' ? null : `${packageDir}/index.ts` %>"
---
export default function <%= h.changeCase.camel(name) %> (): string {
	return '<%= h.changeCase.title(name) %>'
}
