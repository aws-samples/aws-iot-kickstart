"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class CognitoPreTokenGenerationLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c76914e1-80e8-4569-9e8f-897863620eb9',
            functionName: 'Sputnik_CognitoPreTokenGeneration',
            description: 'Sputnik cognito pretoken generation handler',
            code: aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('cognito-pre-token-generation')),
        }));
    }
}
exports.CognitoPreTokenGenerationLambda = CognitoPreTokenGenerationLambda;
//# sourceMappingURL=index.js.map