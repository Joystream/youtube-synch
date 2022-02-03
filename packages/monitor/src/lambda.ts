import * as aws from '@pulumi/aws';
import * as pulumi from "@pulumi/pulumi";
export function lambda(name: string, handler: string, source: string){
    const role = new aws.iam.Role(`${name}Role`, {
        assumeRolePolicy: {
           Version: "2012-10-17",
           Statement: [{
              Action: "sts:AssumeRole",
              Principal: {
                 Service: "lambda.amazonaws.com",
              },
              Effect: "Allow",
              Sid: "",
           }],
        },
     });
     new aws.iam.RolePolicyAttachment(`${name}Attach`, {
        role: role,
        policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
     });

     new aws.iam.RolePolicyAttachment(`${name}DynamoAttach`, {
         role: role,
         policyArn: aws.iam.ManagedPolicies.AmazonDynamoDBFullAccess
     })
     
     // Next, create the Lambda function itself:
     const func = new aws.lambda.Function(name, {

        code: new pulumi.asset.AssetArchive({
           ".": new pulumi.asset.FileArchive(source),
        }),
        runtime: "nodejs14.x",
        role: role.arn,
        handler: handler,
        name: name
     });
     return func
}