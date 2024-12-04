import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

function setupSwagger(app) {
  const config = new DocumentBuilder()
    .setTitle('mahabub.me backend api')
    .setDescription('API documentation')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

bootstrap();
