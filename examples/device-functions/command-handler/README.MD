# Modbus Client

This module is generic command handler that is used to send command to modbus server. It works with both HTTP and Serial server as it uses a library, [modbus-serial](https://github.com/yaacov/node-modbus-serial), to support connectivity.

## Details

The code inside this module is deployed as Lambda function in AWS. It is used by Sputnik and deployed into the device via Greengrass and runs as long-running Lambda function.
At startup the code lookup for a blueprint configuration in **JSON** format which is provided stringifyed in a environment variable (_MODBUS_MAPPING_).

The above env comes from the blueprint configuration as well and it deployed into the device along with the function.

## Modbus Mapping

Similarly to **modbus-client**, this module uses the same blueprint configuration but uses only the command part:

```json
{
	"commands": [
		{
			"action": "start",
			"target": "coil",
			"address": 40001,
			"value": true
		},
		{
			"action": "stop",
			"target": "coil",
			"address": 40001,
			"value": false
		},
		{
			"action": "auto",
			"target": "register",
			"address": 40002
		},
		{
			"action": "realStart",
			"target": "registers",
			"address": 40001,
			"value": [10, 12, 0]
		},
		{
			"action": "realStop",
			"target": "coils",
			"address": 40001,
			"value": [false, true, true]
		}
	]
}
```

-   `action`: name of the action that you'd like to abstract
-   `target`: the target registry to write the information into. Can be: `coil` or `register`; for multivalue `coils` and `registers` target can be used
-   `address`: address of the registry
-   `value`: optional, will define the value to send to the registry. If not defined, the value must come from the MQTT message; when the target is `coils` or `registers` the value must be an array

## Command format

Commands come from MQTT topic with subscription defined in Greengrass and the handler will take it and interpreat to send either to the modbus server or use it as internal command to be used by the long running Lambda.

There are two type of command: device and system. The first are sent to the modbus server while the second type are internally processed and set into the shadow so that other processes can use it (eg. long running Lambda)

The commands will come from the MQTT topic in the following format:

```json
{
	"command": {
		"type": "system",
		"payload": {
			"namespace": "ABCD"
		}
	}
}
```

This is an example of system device

```json
{
	"command": {
		"type": "device",
		"payload": {
			"action": "start"
		}
	}
}
```

this is an example of device command. As you can see from here the action is `start` and it match the same action defined in the blueprint.
If the action has a value already defined in the blueprint then it should not specified in the MQQT message.

For messages where the value is dynamic and potentially an user input value must be specified in the MQQT message but will not reside in the blueprint configuration.

```json
{
	"command": {
		"type": "device",
		"payload": {
			"action": "auto",
			"value": 50
		}
	}
}
```

As for this example the action `auto` does not contain a value in the blueprint configuration and thus a value must be specified in the MQQT message. The defined value will be directly written in the registry mapped with that action.
