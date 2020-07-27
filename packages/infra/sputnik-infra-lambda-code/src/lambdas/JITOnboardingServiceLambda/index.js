"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class JITOnboardingServiceLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    static get codeAsset() {
        return aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('jit-onboarding-service'));
    }
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c4a606e0-cfec-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_JITOnboardingServices',
            description: 'Sputnik JITOnboarding microservice',
            code: JITOnboardingServiceLambda.codeAsset,
        }));
    }
}
exports.JITOnboardingServiceLambda = JITOnboardingServiceLambda;
//# sourceMappingURL=index.js.map