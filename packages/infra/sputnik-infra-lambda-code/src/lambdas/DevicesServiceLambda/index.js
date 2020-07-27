"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class DevicesServiceLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c4a6024e-cfec-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_DevicesServices',
            description: 'Sputnik Devices microservice',
            code: aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('devices-service')),
        }));
    }
}
exports.DevicesServiceLambda = DevicesServiceLambda;
//# sourceMappingURL=index.js.map