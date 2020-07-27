"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class DeviceNamespaceSyncLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'b0d2f8a4-aba5-4632-994d-87b2a5bfa27b',
            functionName: 'Sputnik_DeviceNamespaceSync',
            description: 'Sputnik device namespace sync',
            code: aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('device-namespace-sync')),
        }));
    }
}
exports.DeviceNamespaceSyncLambda = DeviceNamespaceSyncLambda;
//# sourceMappingURL=index.js.map