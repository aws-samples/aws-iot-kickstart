"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class S3HelperLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    static get codeAsset() {
        return aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('s3-helper'));
    }
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c4a60906-cfec-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_S3HelperXServices',
            description: 'Sputnik S3HelperX microservice',
            code: S3HelperLambda.codeAsset,
        }));
    }
}
exports.S3HelperLambda = S3HelperLambda;
//# sourceMappingURL=index.js.map