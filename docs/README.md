# Sputnik Documentation

## [Quick Start](quick-start.md)
> Launch the application and pipeline stacks quickly to start development

## Device Abstraction

### [Device Types](concepts/device-types.md)
> Abstraction of device hardware and periphreals to build complete device specification in combination with *Device Blueprint*.
> - UP2 V2 with Modbus
> - UP2 V2 with Modbus and GPS
> - ADLink V123 with Modbus
### [Device Blueprints](concepts/device-blueprints.md)
> Abstraction of specific device use case to define the application code and resources required to connect the device to your application.
> - Genset Volvo with Modbus Connector
> - Forklift Toyota with Modbus Connector and GPS
### ~~[System Blueprint](concepts/system-blueprints.md)~~
> Abstraction of multiple devices functioning as a system.
> - Warehouse
> - Mine

### [Deployment Meta Language](concepts/deloyment-meta-language.md)

---
## Modbus Integration
How to define modbus connections and handling via **Device Blueprint** and on device functions.
### [Modbus Command Handling](../examples/device-functions/command-handler/README.MD)
> This module is generic command handler that is used to send command to modbus server.
### [Modbus Client](../examples/device-functions/modbus-client/README.md)
> This module is generic modbus client that can be used to connect to a modbus server.

---
## Visualization
How to create graphs for both real-time and historical data.
### [Visualization Overview](concepts/visualization.md)
> Overview of visualization capabilities and charting integration.
