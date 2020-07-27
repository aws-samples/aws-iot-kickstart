"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class AdminServiceLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'a91debe6-cfdc-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_AdminServices',
            description: 'Sputnik Admin microservice',
            code: aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('admin-service')),
        }));
    }
}
exports.AdminServiceLambda = AdminServiceLambda;
//# sourceMappingURL=index.js.map