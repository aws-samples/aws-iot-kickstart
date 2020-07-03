# User Management / Multi-Tenancy

User management is controlled via Amazon Cognito user groups and Sputnik provides basic user management functionality to facilite inviting users to groups and basic user authentication flow control (forgot password, change password, etc), but does not have extensive user management capabilities.

There is basic multi-tenancy support started to highlight `namespacing` device data based on tenancy.
> This is intended as example only to get started and not production ready.

## Multi-Tenancy

We have added multi-tenancy to Sputnik to meet the needs of restricting device event data to users that belong to the device at the time each individual data event was published. This is done by setting the "namespace" property on the device, which instructs the device to publish events to IoT topic of `{namespace}/data/event` and `{namespace}/data/alert`.

We have added the concept of **Tenant**, which is an extension of Cognito User Group specific to data handling within the project. The purpose of **tenant** compared to regular group is to facilitate binding a user during login to the **namespace** associated with *tenancy* the user belongs to, and in turn enabling policy/query mechanisms to prevent access to data.

> The integration of `namespace` with access control is heavily dependent on final data storage and querying design. At this point, there is no permissions based control on data within Sputnik as this has been off-loaded to other open-source framework.

### Internal Users

Internal users are either in the **Administrators** or **Members** user group(s), and will be identified as **Internal** tenant. This **Internal** tenant is assigned the `default` namespace, and granted access to all data.

The current model assums that single company owns all devices and is leasing to customers. But it does not scale to SaaS model, where multiple companies have individual devices, groups and rules.

### External Users
Using the “Users” panel in the WebUI, administrators can create a new tenant for each external customer, and invite users to be part of that customer tenant group.

## Add Tenant (Admin)
As an **Administrator**, you have access to **Users** panel in the UI. From this panel click the `[Add tenannt]` button and complete the form.

## Add User (Admin)
As an **Administrator**, you have access to **Users** panel in the UI. From this panel click the `[Invite user]` button and complete the form.
