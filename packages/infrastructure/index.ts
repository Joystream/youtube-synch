import * as aws from '@pulumi/aws';
import * as apigateway from '@pulumi/aws-apigateway'
import {handler} from '../api/src/lambda'

const lambdaHandler = new aws.lambda.CallbackFunction("handler", {
    callback: (evt, ctx, cb) => handler(evt, ctx as any, cb)
})

const api = new apigateway.RestAPI("api", {
    routes:[
        {
            path:'/{proxy+}',
            method: 'ANY',
            eventHandler: lambdaHandler
        }
    ]
})