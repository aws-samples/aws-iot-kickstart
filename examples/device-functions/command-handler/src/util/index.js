const updateThingShadowAsync = (client, params) => {
	return new Promise((resolve, reject) => {
		client.updateThingShadow(params, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

function capitalize (string) {
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

exports.default = {
	updateThingShadowAsync,
	capitalize,
}
