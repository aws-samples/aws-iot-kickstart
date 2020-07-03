const distinct = (array) => array.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i)

exports.default = {
	distinct,
}
