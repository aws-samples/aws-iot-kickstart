import { Greengrass } from 'aws-sdk'

export type GetDefinitionRequest =
	Greengrass.GetCoreDefinitionRequest |
	Greengrass.GetConnectorDefinitionRequest |
	Greengrass.GetFunctionDefinitionRequest |
	Greengrass.GetSubscriptionDefinitionRequest |
	Greengrass.GetLoggerDefinitionRequest |
	Greengrass.GetDeviceDefinitionRequest |
	Greengrass.GetResourceDefinitionRequest

export type GetDefinitionResponse =
	Greengrass.GetCoreDefinitionResponse |
	Greengrass.GetConnectorDefinitionResponse |
	Greengrass.GetFunctionDefinitionResponse |
	Greengrass.GetSubscriptionDefinitionResponse |
	Greengrass.GetLoggerDefinitionResponse |
	Greengrass.GetDeviceDefinitionResponse |
	Greengrass.GetResourceDefinitionResponse

export type CreateDefinitionRequest =
	Greengrass.CreateCoreDefinitionRequest |
	Greengrass.CreateConnectorDefinitionRequest |
	Greengrass.CreateFunctionDefinitionRequest |
	Greengrass.CreateSubscriptionDefinitionRequest |
	Greengrass.CreateLoggerDefinitionRequest |
	Greengrass.CreateDeviceDefinitionRequest |
	Greengrass.CreateResourceDefinitionRequest

export type CreateDefinitionResponse =
	Greengrass.CreateCoreDefinitionResponse |
	Greengrass.CreateConnectorDefinitionResponse |
	Greengrass.CreateFunctionDefinitionResponse |
	Greengrass.CreateSubscriptionDefinitionResponse |
	Greengrass.CreateLoggerDefinitionResponse |
	Greengrass.CreateDeviceDefinitionResponse |
	Greengrass.CreateResourceDefinitionResponse

export type GetDefinitionVersionRequest =
	Greengrass.GetCoreDefinitionVersionRequest |
	Greengrass.GetConnectorDefinitionVersionRequest |
	Greengrass.GetFunctionDefinitionVersionRequest |
	Greengrass.GetSubscriptionDefinitionVersionRequest |
	Greengrass.GetLoggerDefinitionVersionRequest |
	Greengrass.GetDeviceDefinitionVersionRequest |
	Greengrass.GetResourceDefinitionVersionRequest

export type GetDefinitionVersionResponse =
	Greengrass.GetCoreDefinitionVersionResponse |
	Greengrass.GetConnectorDefinitionVersionResponse |
	Greengrass.GetFunctionDefinitionVersionResponse |
	Greengrass.GetSubscriptionDefinitionVersionResponse |
	Greengrass.GetLoggerDefinitionVersionResponse |
	Greengrass.GetDeviceDefinitionVersionResponse |
	Greengrass.GetResourceDefinitionVersionResponse

export type CreateDefinitionVersionRequest =
	Greengrass.CreateCoreDefinitionVersionRequest |
	Greengrass.CreateConnectorDefinitionVersionRequest |
	Greengrass.CreateFunctionDefinitionVersionRequest |
	Greengrass.CreateSubscriptionDefinitionVersionRequest |
	Greengrass.CreateLoggerDefinitionVersionRequest |
	Greengrass.CreateDeviceDefinitionVersionRequest |
	Greengrass.CreateResourceDefinitionVersionRequest

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
