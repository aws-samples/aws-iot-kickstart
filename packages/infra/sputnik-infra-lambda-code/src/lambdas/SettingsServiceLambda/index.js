"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_lambda_1 = require("@aws-cdk/aws-lambda");
const CompiledLambdaFunction_1 = require("../../CompiledLambdaFunction");
class SettingsServiceLambda extends CompiledLambdaFunction_1.CompiledLambdaFunction {
    static get codeAsset() {
        return aws_lambda_1.Code.fromAsset(CompiledLambdaFunction_1.lambdaPath('settings-service'));
    }
    constructor(scope, id, props) {
        super(scope, id, Object.assign({}, props, {
            uuid: 'c4a609f6-cfec-11ea-87d0-0242ac130003',
            functionName: 'Sputnik_SettingsServices',
            description: 'Sputnik Settings microservice',
            code: SettingsServiceLambda.codeAsset,
        }));
    }
}
exports.SettingsServiceLambda = SettingsServiceLambda;
//# sourceMappingURL=index.js.map