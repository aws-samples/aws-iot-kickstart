const { getUser } = require('./user-methods')

const CLAIM_PREFIX = process.env.CLAIM_PREFIX
const INTERNAL_TENANT = process.env.INTERNAL_TENANT
const INTERNAL_NAMESPACE = process.env.INTERNAL_NAMESPACE
const INTERNAL_GROUPS = process.env.INTERNAL_GROUPS.split(',')

if (!CLAIM_PREFIX || !INTERNAL_TENANT || !INTERNAL_NAMESPACE || !INTERNAL_GROUPS) {
	console.warning('Required Env', { CLAIM_PREFIX, INTERNAL_TENANT, INTERNAL_NAMESPACE, INTERNAL_GROUPS })
	throw new Error('Missing required environment variables.')
}

exports.handler = async (event) => {
	console.log(event)

	const user = await getUser(event.userName, event.userPoolId)

	let tenant = user.group
	let namespace = user.group
	let internal = false

	// TODO: support user asignment to multiple tenants
	if (INTERNAL_GROUPS.includes(user.group)) {
		tenant = INTERNAL_TENANT
		namespace = INTERNAL_NAMESPACE
		internal = true
	}

	event.response.claimsOverrideDetails = {
		claimsToAddOrOverride: {
			[`${CLAIM_PREFIX}:tenant`]: tenant,
			[`${CLAIM_PREFIX}:internal`]: internal,
			[`${CLAIM_PREFIX}:namespace`]: namespace,
		},
	}

	return event
}
