# Modbus Client

This module is generic modbus client that can be used to connect to a modbus server. It works with both HTTP and Serial server as it uses a library, [modbus-serial](https://github.com/yaacov/node-modbus-serial), to support connectivity.

## Details

The code inside this module is deployed as Lambda function in AWS. It is used by Sputnik and deployed into the device via Greengrass and runs as long-running Lambda function.
At startup the code lookup for a blueprint configuration in **JSON** format which is provided stringifyed in a environment variable (_MODBUS_MAPPING_).

The above env comes from the blueprint configuration as well and it deployed into the device along with the function.

## Modbus Mapping

The modbus mapping available in the blueprint configuration follows this pattern:

```json
{
	"interval": 2,
	"duration": 1440,
	"connection": {
		"type": "TCP",
		"address": "127.0.0.1",
		"options": {
			"port": 8502
		},
		"unitId": 1
	},
	"holdingRegisters": {
		"registers": [
			{
				"address": 40061,
				"multiplier": 0.1,
				"fieldName": "batteryVoltage"
			},
			{
				"address": 40070,
				"type": "multi",
				"multiplier": 0.1,
				"quantity": 2,
				"lowValueMultiplier": 65536,
				"fieldName": "runningHours"
			},
			{
				"address": 42070,
				"type": "string",
				"multiplier": 1,
				"quantity": 27,
				"fieldName": "alarm"
			},
			{
				"address": 40077,
				"type": "bit",
				"bitNumber": 1,
				"multiplier": 1,
				"fieldName": "underspeed",
				"alert": {
					"operator": "equalTo",
					"target": true
				}
			}
		]
	},
	"inputRegisters": {
		"registers": []
	},
	"coils": {
		"registers": []
	},
	"discreteInputs": {
		"registers": []
	},
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

The structure of the JSON contains the following root level elements:

-   `interval`: define the interval in second after which the client will ping the server to get the details and report them to the cloud. Default **2 seconds**, can be changeed also with `RT_INTERVAL` env variable
-   `duration`: define the duration of the event in minute. This is useful in case the data are stored into DynamoDB and a field is required to define the TTL, the full value will be reported as expiresAt property. Default _1440 minute_ (1 day), can be changed also with `RT_DURATION` env
-   `connection`: define the configuration to be used to connect to the modbus server
-   `holdingRegisters`: define the configuration to be used to read information from holding registers, more details below
-   `inputRegisters`: define the configuration to be used to read information from input registers, more details below
-   `coils`: define the configuration to be used to read information from coils, more details below
-   `discreteInputs`: define the configuration to be used to read information from discrete inputs, more details below
-   `commands`: define the configuration to be used when receiving commands, more details below

### Connection

The following describe the configuration used by the code to enstablish connectivity with the modbus server. It follow this JSON structure:

```json
"connection": {
  "type": "TCP",
  "address": "127.0.0.1",
  "options": {
    "port": 8502
  },
  "unitId": 1
}
```

-   `type`: define the connection type. Accept one the following values: `TCP`, `RTU`, `UDP`, `TcpRTUBuffered`, `Telnet`, `C701`, `RTUBuffered` or `AsciiSerial`
-   `address`: IP address or serial port path. eg. `127.0.0.1` or `/dev/ttyUSB0`
-   `options`: connection options vary based on connection type:
    -   Allowed value valid for all connection types besides serial (RTU, RTUBuffered and AsciiSerial)
        -   `port`: port number where the genset server listen to. eg. 8502
    -   Allowed value only for serial connection (RTU, RTUBuffered and AsciiSerial)
        -   `baudRate`: bound rate for the serial port
        -   `parity`: one of `none`, `even`, `mark`, `odd` or `space`;

More connection options are available for serial connections and can be found on the [serial port documentation](https://serialport.io/docs/api-stream#openoptions) which is the module used by [node-modbus-serial](https://github.com/yaacov/node-modbus-serial) to make serial connections.

### Registry Configuration

The following describe the common configuration to read information from the modbus registers and would be the same for the following: `holdingRegisters`, `inputRegisters`, `coils` and `discreteInputs`

```json
"holdingRegisters": {
  "maxReadCount": 10,
  "registers": [
    {
      "address": 40061,
      "multiplier": 0.1,
      "fieldName": "batteryVoltage"
    },
    {
      "address": 40070,
			"type": "multi",
			"quantity": 2,
      "multiplier": 0.1,
      "lowValueMultiplier": 65536,
      "fieldName": "runningHours"
    },
			{
				"address": 42070,
				"type": "string",
				"multiplier": 1,
				"quantity": 27,
				"fieldName": "alarm"
			},
    {
      "address": 40077,
      "type": "bit",
      "bitNumber": 1,
      "multiplier": 1,
      "fieldName": "underspeed",
      "alert": {
        "operator": "equalTo",
        "target": true
      }
    }
  ]
}
```

-   `registers`: an array of object that defines the individual registry that have to be read. Contains the following properties
    -   `address`: define the registry address to read
    -   `multiplier`: used to multiply the value retrieved from the registry, can use `1` if unsure
    -   `fieldName`: the name of the property that you're reading, will be used to compose the JSON object that will be send via MQQT topic
    -   `type`: used to define the type of data to read. Can be omitted in case not required, at the moment supports `multi`, `bit` and `string`
    -   `lowValueMultiplier`: available only for `multi` defines the multipler for the low value read from two registry. This type will automatically read two registry sequentially from the one defined in the address to compute a single value property
    -   `bitNumber`: available only for `bit` type define which significant bit has to be taken from the value read
    -   `quantity`: to be specified for `multi` and `string` type, define the number of consequtive registry to read
    -   `alert`: can be used, optionally, in any of the property. It defines the alert structure and will allow to send data in a specific topic if the condition is met
        -   `operator`: one of the following: `equalTo`, `notEqualTo`, `greaterThan`, `lessThan`, `greaterEqualThan` or `lessEqualThan`
        -   `target`: the target value to compare against the one read from the registry. If condition is met the data will be published in the alert topic

The codebase can be extended to include multiple type based on your usecase. Look into `src/reader/types` to define new types that might need to be abstracted for the specific device.

Note: The configuration above is only above `holdingRegisters` but it's still applicable to all the other registers (`inputRegisters`, `coils`, `discreteInputs`)

The high level name convention correspond to the following function code:

-   `coils`: `FC=01`
-   `discreteInputs`: `FC=02`
-   `holdingRegisters`: `FC=03`
-   `inputRegisters`: `FC=04`

### Command Configuration

The following describe the common configuration used when commands are sent to the device

```json
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
```

-   `action`: name of the action that you'd like to abstract
-   `target`: the target registry to write the information into. Can be: `coil` or `register`; for multivalue `coils` and `registers` target can be used
-   `address`: address of the registry
-   `value`: optional, will define the value to send to the registry. If not defined, the value must come from the MQTT message; when the target is `coils` or `registers` the value must be an array

For more details about message configuration look for **command-handler** module

# Sample data

The define will publish data into specific topic (data or alert) with the following common properties:

```json
{
	"namespace": "",
	"deviceId": "",
	"timestamp": "",
	"expiresAt": ""
}
```

to this object will be appended all the property read from the modbus that are defined in the blueprint configuration as described above.
