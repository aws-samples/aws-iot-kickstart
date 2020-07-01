# Sputnik Visualization

The visualization capabilities of Sputnik are verify limited as it focuses primarily on device management.

There are 2 types of visualization that have been partially developed to act as starting place to integrate and build out the capabilities.

## IoT Connected
There are some widgets built out that use Chart.js for visualizations and are setup to stream events directly from devices
by subscribing to MQTT events directly from IoT Core.

The widgets use the [websiteCognitoIoTPolicy](../../cdk/lib/stack/nested/identity/CognitoPersistentStack/index.ts) defined in `appVariables.js` managed by [websiteConfig](../../cdk/lib/stack/nested/existing/SputnikStack/index.ts) resource to gain access to device topics.

Look into the [Website Widgets](../../source/console/src/app/widgets) for widget code.

See [blueprint views](blueprint-views.md) for more details on config.

> [SECURITY] Currently there is no permissions scoped at device level.

## Query Based
There was some preliminary work done on integrating Echart visualization with AppSync queries to fetch both real-time and historical data.

See [Website widgets dashboard](../../source/console/src/app/widgets/dashboards) for example of how to get started.

The final implemenation on this will greatly depend on the final architecture used to store and query the data.
There are very different pros/cons as well as implementation details based on specific services/api schema used.
