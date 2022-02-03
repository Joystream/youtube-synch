/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import {config} from 'aws-sdk'
config.update({'region':'eu-west-1'})
function setupSwagger(app: INestApplication){
  const config = new DocumentBuilder()
  .setTitle('Joystream Youtube Sync API')
  .setDescription('Youtube Sync API')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}

async function bootstrap(){
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    allowedHeaders: '*',
    methods: '*',
    origin: '*',
  });
  setupSwagger(app);
  await app.init();
  return app.listen(3001)
}

bootstrap()