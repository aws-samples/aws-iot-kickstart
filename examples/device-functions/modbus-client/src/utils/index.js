const sleep = (timeout) =>
	new Promise((resolve) =>
		setTimeout(() => {
			resolve()
		}, timeout),
	)

const getShadownAsync = (client, thingName) => {
	return new Promise((resolve, reject) => {
		client.getThingShadow({
			thingName,
		}, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

const publishAsync = (client, params) => {
	return new Promise((resolve, reject) => {
		client.publish(params, (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

/**
 * Generates number of random geolocation points given a center and a radius.
 *
 * Reference URL: http://goo.gl/KWcPE.
 * @param  {Object} center A JS object with 'latitude' and 'longitude' attributes.
 * @param  {number} radius Radius in meters.
 * @return {Object} The generated random points as JS object with latitude and longitude attributes.
 */
const generateRandomPoint = (center, radius) => {
	var x0 = center.longitude
	var y0 = center.latitude

	// Convert Radius from meters to degrees.
	var rd = radius / 111300

	var u = Math.random()
	var v = Math.random()

	var w = rd * Math.sqrt(u)
	var t = 2 * Math.PI * v
	var x = w * Math.cos(t)
	var y = w * Math.sin(t)

	var xp = x / Math.cos(y0)

	return {
		latitude: y + y0,
		longitude: xp + x0,
	}
}

exports.default = {
	sleep,
	getShadownAsync,
	publishAsync,
	generateRandomPoint,
}
