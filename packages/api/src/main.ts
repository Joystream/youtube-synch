/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dynamoose from 'dynamoose';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  dynamoose.aws.sdk.config.update({ region: 'eu-west-1' });
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Joystream Youtube Sync API')
    .setDescription('Youtube Sync API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  app.enableCors({
    allowedHeaders: '*',
    methods: '*',
    origin: '*',
  });
  await app.listen(3001);
}

bootstrap();
