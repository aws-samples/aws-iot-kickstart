const BlueprintParser = require('./lib/blueprint-parser');

const blueprintParser = new BlueprintParser();

let spec = {
    FunctionDefinition: {
        Functions: [
            {
                FunctionArn: 'Arn1',
                Variables: {
                    Var1: 'Var11Value',
                    Var2: 'Var12Value'
                }
            },
            {
                FunctionArn: 'Arn2',
                Variables: {
                    Var1: 'Var21Value',
                    Var2: 'Var22Value'
                }
            }
        ]
    }
}

const action = '!SetAtt[toto,!On[Arn2,FunctionArn,FunctionDefinition.Functions]Variables.Titi]';


blueprintParser.parse(spec, action).then(result => console.log(result)).catch(err => console.error(err));
