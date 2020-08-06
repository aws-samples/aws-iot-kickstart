import addTenant from './addTenant'
import deleteUser from './deleteUser'
import disableUser from './disableUser'
import enableUser from './enableUser'
import getUser from './getUser'
import inviteUser from './inviteUser'
import listGroups from './listGroups'
import listTenants from './listTenants'
import listUsers from './listUsers'
import updateUser from './updateUser'

export const commands = {
	addTenant,
	deleteUser,
	disableUser,
	enableUser,
	getUser,
	inviteUser,
	listGroups,
	listTenants,
	listUsers,
	updateUser,
}

export const commandNames = Object.keys(commands)
