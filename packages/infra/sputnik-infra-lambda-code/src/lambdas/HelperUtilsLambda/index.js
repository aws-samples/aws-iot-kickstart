"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class HelperUtilsLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    static get codeAsset() {
        return aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('helper-utils'));
    }
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c4a605c8-cfec-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_HelperUtils',
            description: 'Sputnik Helper Utils microservice',
            code: HelperUtilsLambda.codeAsset,
        }));
    }
}
exports.HelperUtilsLambda = HelperUtilsLambda;
//# sourceMappingURL=index.js.map