# NestJS

Nest (NestJS) is a framework for building efficient, scalable **[Node.js](https://nodejs.org/)** server-side applications. It uses progressive JavaScript, is built with and fully supports **[TypeScript](http://www.typescriptlang.org/)** (yet still enables developers to code in pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

Under the hood, Nest makes use of robust HTTP Server frameworks like **[Express](https://expressjs.com/)** (the default) and optionally can be configured to use **[Fastify](https://github.com/fastify/fastify)** as well!

Nest provides a level of abstraction above these common Node.js frameworks (Express/Fastify), but also exposes their APIs directly to the developer. This allows developers the freedom to use the myriad of third-party modules which are available for the underlying platform.

### CLI shortcuts:

- Instllation and creating project

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

- Creating controller

```bash
nest g co
```

- Creating controller w/o tests

```bash
nest g co --no-spec
```

Generates a contoller with a specified name which is located in **_Controller_** decorator.

Example:

```bash
nest g co coffees --no-spec
```

Generates coffes folder with `coffees.controller.ts` file inside. Controller has `coffees` string param inside and requests can be done to `hostname/coffees` .

---

### Requests

- **GET** - To create a get request for route `/coffees/flavors` add `Get` decorator to Coffees controller:

```tsx
@Get('/flavors')
findAll(): string {
	return 'Flavors';
}
```

- **POST** - \*\*\*\*To create a post route specify a route name in `Post` decorator param, pass `Body` decorator to function's param and access the body request:

```tsx
@Post()
createOne(@Body() body: any): any {
  return body;
}
```

To specify the concrete prop u need specify it in `Body` decorator param:

```tsx
@Post()
createOne(@Body('name') body: string): string {
    return body;
}
```

JSON:

```json
{
  "name": "Post request"
}
```

- **PATCH** - To create a patch route use `@Patch` decorator with params:

```tsx
@Patch(':id')
update(@Param('id') id: string, @Body() body: any): string {
    return `This action updates #${id} coffee`;
}
```

---

- **DELETE** - To create a delete route use `@Delete` decorator with params:

```tsx
@Delete(':id')
remove(@Param('id') id: string): string {
    return `This action removes #${id} coffee`;
}
```

### Params

The router param name can be specified via : in `Get` decorator:

```tsx
@Get(':id')
findOne(@Param() params: { id: string }): string {
	return `This action returns #${params.id} coffee`;
}
```

Can be accessed in function params with the help of decorator. U can take not the whole object, but only one property:

```tsx
@Get(':id')
findOne(@Param('id') id: string): string {
	return `This action returns #${id} coffee`;
}
```

---

HTTP Code

Add `@HttpCode` decorator to the request and provide status in the params from `@nestjs/common` module.

```tsx
@Post()
@HttpCode(HttpStatus.CREATED)
```

It's possible, but no so recommended to use `@Res()` decorator in method params:

```tsx
@Get('/flavors')
findAll(@Res() response) {
  response.status(200).send('This action returns all coffees');
}
```

### Query

Add `@Query` decorator form `@nestjs/common` package to method params:

```tsx
 @Get()
  findAll(@Query() paginationQuery): string {
    const { limit, offset } = paginationQuery;

    return `This action returns all coffees. Limit: ${limit}, offset: ${offset}`;
  }
```

## Services

Each service is a provider, so it can inject dependencies.

CLI shortcut to generate service:

```bash
nest g s
```

To use a service pass create an instnace of it in the controller constructor:

```tsx
constructor(private readonly coffeesService: CoffeesService) {}
```

Service example:

```tsx
import { Injectable } from "@nestjs/common";

import { Coffee } from "./entities/coffee.entity";

@Injectable()
export class CoffeesService {
  private coffees: Array<Coffee> = [
    {
      id: 1,
      name: "Shipwrech Roast",
      brand: "Buddy Brew",
      flavors: ["chocolate", "vanilla"],
    },
  ];

  public findAll() {
    return this.coffees;
  }

  public findOne(id: string) {
    return this.coffees.find((coffee) => coffee.id === +id);
  }

  public create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
  }

  public update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);

    if (existingCoffee) {
      //    update the existing coffee
    }
  }

  public remove(id: string) {
    const coffeeIndex = this.coffees.findIndex((item) => item.id === +id);

    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}
```

### Handling Errors

```tsx
@Get(':id')
  findOne(@Param('id') id: string): Coffee | HttpException {
    const coffee = this.coffeesService.findOne(id);

    if (!coffee) {
      // throw new HttpException(`Coffee #${id}, not found`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`Coffee #${id}, not found`);
    }

    return coffee;
  }
```

## Modules

Generate a module:

```bash
nest g module <name>
```

```tsx
import { CoffeesService } from "./coffees.service";
import { CoffeesController } from "./coffees.controller";

@Module({
  controllers: [CoffeesController],
  providers: [CoffeesService],
})
export class CoffeesModule {}
```

### DTO

DTO(Data transfer object) are well used to craete a type safety to the application. They craete a definition for the shape of the data that comes to the body of the request.

```tsx
export class UpdateCoffeeDto {
  readonly name?: string;
  readonly brand?: string;
  readonly flavors?: string[];
}
```

**Validate Dtos**

First of all, use set global validation in main.ts file:

```tsx
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

U can pass a `whitelist` property set to true in ValidateionPipe in order to remove all invalid and unwandted properties passed to the body:

```tsx
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

The validation can be used with a help of `class-validator` libary:

```tsx
import { IsString } from "class-validator";

export class CreateCoffeeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly brand: string;

  @IsString({ each: true })
  readonly flavors: string[];
}
```

In order not to duplicate the code for update Dto, u can use `@nestjs/mapped-types` package:

```tsx
import { PartialType } from "@nestjs/mapped-types";
import { CreateCoffeeDto } from "./create-coffee.dto";

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {}
```

PartialType will return the type of CreateCoffeeDto and make all the fields optional.

To enable auto-transform Payloads to DTO enable `transform` in ValidationPipe params:

```tsx
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

It will make the body object the instanse of the Dto class.
