"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class DeploymentsServiceLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    static get codeAsset() {
        return aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('deployments-service'));
    }
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'b7fd16c2-4397-4b19-8626-196fb37e5770',
            functionName: 'Sputnik_DeploymentsServices',
            description: 'Sputnik Deployments microservice',
            code: DeploymentsServiceLambda.codeAsset,
        }));
    }
}
exports.DeploymentsServiceLambda = DeploymentsServiceLambda;
//# sourceMappingURL=index.js.map