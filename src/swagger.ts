import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const swagger = (app: INestApplication) => {
  const options = new DocumentBuilder()
    .setTitle('E-Commerce Backend System')
    .setDescription(
      'API Documentation \
      \nNOTE: The API with (LOCK) symbol can be used only after providing token in (Authorize).\
      \nParameter with * are required to execute related API.',
    )
    .setVersion('1.0')
    .addServer('/api/')
    .addBearerAuth({ type: 'apiKey', name: 'x-access-token', in: 'header' })
    .build();

  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true,
    include: [],
  });
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'E-Commerce Backend System',
    explorer: false,
  });
};
