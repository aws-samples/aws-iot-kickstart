"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class XXXXXServiceLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c4a60d3e-cfec-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_UsageMetrics',
            description: 'Sputnik UsageMetrics',
            code: aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('metrics-usage')),
        }));
    }
}
exports.XXXXXServiceLambda = XXXXXServiceLambda;
//# sourceMappingURL=index.js.map