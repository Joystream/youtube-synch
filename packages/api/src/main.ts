/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import serverlessExpress from '@vendia/serverless-express'
import { Callback, Context, Handler } from 'aws-lambda';
function setupSwagger(app: INestApplication){
  const config = new DocumentBuilder()
  .setTitle('Joystream Youtube Sync API')
  .setDescription('Youtube Sync API')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    allowedHeaders: '*',
    methods: '*',
    origin: '*',
  });
  setupSwagger(app);
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
 
  return serverlessExpress({ app: expressApp });
}


export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  if(event.path === '/api'){
    event.path = '/api/'
  }
  event.path = event.path.includes('swagger-ui') ? `/api${event.path}` : event.path
  const server = await bootstrap();
  return server(event, context, callback)
}