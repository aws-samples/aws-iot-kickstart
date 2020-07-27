"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class SystemsServiceLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    static get codeAsset() {
        return aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('systems-service'));
    }
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c4a60c30-cfec-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_SystemsServices',
            description: 'Sputnik Systems microservice',
            code: SystemsServiceLambda.codeAsset,
        }));
    }
}
exports.SystemsServiceLambda = SystemsServiceLambda;
//# sourceMappingURL=index.js.map