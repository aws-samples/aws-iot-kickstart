import { Greengrass } from 'aws-sdk'

export type GetDefintionResponse =
	Greengrass.GetCoreDefinitionResponse |
	Greengrass.GetConnectorDefinitionResponse |
	Greengrass.GetFunctionDefinitionResponse |
	Greengrass.GetSubscriptionDefinitionResponse |
	Greengrass.GetLoggerDefinitionResponse |
	Greengrass.GetDeviceDefinitionResponse |
	Greengrass.GetResourceDefinitionResponse

export type CreateDefintionResponse =
	Greengrass.CreateCoreDefinitionResponse |
	Greengrass.CreateConnectorDefinitionResponse |
	Greengrass.CreateFunctionDefinitionResponse |
	Greengrass.CreateSubscriptionDefinitionResponse |
	Greengrass.CreateLoggerDefinitionResponse |
	Greengrass.CreateDeviceDefinitionResponse |
	Greengrass.CreateResourceDefinitionResponse

export type GetDefinitionVersionResponse =
	Greengrass.GetCoreDefinitionVersionResponse |
	Greengrass.GetConnectorDefinitionVersionResponse |
	Greengrass.GetFunctionDefinitionVersionResponse |
	Greengrass.GetSubscriptionDefinitionVersionResponse |
	Greengrass.GetLoggerDefinitionVersionResponse |
	Greengrass.GetDeviceDefinitionVersionResponse |
	Greengrass.GetResourceDefinitionVersionResponse

export type CreateDefinitionVersionResponse =
	Greengrass.CreateCoreDefinitionVersionResponse |
	Greengrass.CreateConnectorDefinitionVersionResponse |
	Greengrass.CreateFunctionDefinitionVersionResponse |
	Greengrass.CreateSubscriptionDefinitionVersionResponse |
	Greengrass.CreateLoggerDefinitionVersionResponse |
	Greengrass.CreateDeviceDefinitionVersionResponse |
	Greengrass.CreateResourceDefinitionVersionResponse

export type DefinitionVersion =
	Greengrass.CoreDefinitionVersion |
	Greengrass.ConnectorDefinitionVersion |
	Greengrass.FunctionDefinitionVersion |
	Greengrass.SubscriptionDefinitionVersion |
	Greengrass.LoggerDefinitionVersion |
	Greengrass.DeviceDefinitionVersion |
	Greengrass.ResourceDefinitionVersion
