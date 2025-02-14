import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('Task Management System')
    .setDescription('Swagger Documentation of Task Management System')
    .setVersion('1.0')
    .addBearerAuth({type: "http"}, 'jwt')
    .addTag('')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const PORT = process.env.NODE_PORT || 5000
  await app.listen(PORT, ()=>console.log("Server is running on port", PORT));
}
bootstrap();