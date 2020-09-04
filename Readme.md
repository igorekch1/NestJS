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

### TypeOrm + PostgreSQL integration

installation:

```bash
yarn add @nestjs/typeorm typeorm pg
```

Add TypeOrmModule to imports in app module:

```tsx
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CoffeesModule } from "./coffees/coffees.module";

@Module({
  imports: [
    CoffeesModule,
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "pass123",
      database: "postgres",
      autoLoadEntities: true, // models will be loaded automatically (you don't have to explicitly specify the entities: [] array)
      synchronize: true, // your entities will be synced with the database (ORM will map entity definitions to corresponding SQL tabled), every time you run the application (recommended: disable in the production)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Creating entity:**

```tsx
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// @Entity('coffees') sql table === 'coffees'
@Entity() // sql table === 'coffee'
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column("json", { nullable: true })
  flavors: string[];
}
```

Add entity to the module it's used in

```tsx
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CoffeesService } from "./coffees.service";
import { CoffeesController } from "./coffees.controller";
import { Coffee } from "./entities/coffee.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Coffee])],
  controllers: [CoffeesController],
  providers: [CoffeesService],
})
export class CoffeesModule {}
```

### Repository

Repository is used to manage a concrete entity (to manage any entity u can use EntityManager)

To work with entity repository u should to inject it first in your service:

```tsx
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>
  ) {}
}
```

And then call methods on its repository that it provides. Example w/ pagination:

```tsx
public findAll(paginationQuery: PaginationQueryDto): Promise<Array<Coffee>> {
    const { limit, offset } = paginationQuery;

    return this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }
```

### Relations

Many to many relation example:

Coffee entity field:

```tsx
@JoinTable()
  @ManyToMany(
    _ => Flavor,
    flavor => flavor.coffees,
    {
      cascade: true, // ['insert']
    },
  )
  flavors: Flavor[];
```

Flavor entity field:

```tsx
@ManyToMany(
    _ => Coffee,
    coffee => coffee.flavors,
  )
  coffees: Array<Coffee>;
```

Specify relation in param on query:

```tsx
public async findOne(id: string): Promise<Coffee> {
    const coffee = await this.coffeeRepository.findOne(id, {
      relations: ['flavors'], // related to flavors table
    });

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }

    return coffee;
  }
```

### Transaction

Transactions are created using Connection or EntityManager.

Example w/ `queryRunner`:

First, inject connection:

```tsx
constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    private readonly connection: Connection,
  ) {}
```

Usage of queryRunner:

```tsx
public async recommendCoffee(coffee: Coffee): Promise<void> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recomendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
```

Event entity:

```tsx
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Index(["name", "type"])
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Index()
  @Column()
  name: string;

  @Column("json")
  payload: Record<string, any>;
}
```

### Migrations

Creating a TypeOrm Migration:

```bash
npx typeorm migration:create -n CoffeeRefactor
```

CoffeeRefactor being the NAME we are giving "this" migration

Migration file:

```tsx
public async up(queryRunner: QueryRunner): Promise<any> {
  await queryRunner.query(
    `ALTER TABLE "coffee" RENAME COLUMN "name" TO "title"`,
  );
}

public async down(queryRunner: QueryRunner): Promise<any> {
  await queryRunner.query(
    `ALTER TABLE "coffee" RENAME COLUMN "title" TO "name"`,
  );
}
```

Running migration:

1. Compile project first:

```bash
npm run build
```

2. Run migration

```bash
npx typeorm migration:run
```

REVERT migration(s)

```bash
npx typeorm migration:revert
```

Or u can generate migration using CLI:

```bash
npx typeorm migration:generate -n SchemaSync
```

### Dependency Injection

3 key steps in the dependency injection process:

- @Injectable class decorator that can be managed by the nest container. This decorator marks a class as a provider.
- Request class in the constructor where it's used in order to utilize it
- This class also should be a provider

When Nest initiate a controller it looks if any dependencies are needed. It looks for dependency class and performs a look on service token which indicates the class. Then will initiate a singleton class, cache it and return it.

Provider:

```tsx
providers: [CoffeesService] ==> providers: [{provide: CoffeesService, useClass: CoffeesService}]
```

Associating a token(provide) with a class CoffeesService(useClass)

### Module Encapsulation

CLI:

```bash
nest g mo <name>
```

All modules encapsulates all providers in the modules. So, in order to use a provider from another module you need to export it (add to exports property) from this module and also add this module to the imports property of the module where it's provider is used.

### Providers

Many of the basic Nest classes may be treated as a provider – services, repositories, factories, helpers, and so on. The main idea of a provider is that it can inject dependencies; this means objects can create various relationships with each other, and the function of "wiring up" instances of objects can largely be delegated to the Nest runtime system. A provider is simply a class annotated with an @Injectable() decorator.

**Value based Providers** can be used in a testing purpose (useValue):

```tsx
class MockCoffeeService {}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController],
  providers: [{ provide: CoffeesService, useValue: new MockCoffeeService() }],
})
export class CoffeesModule {}
```

**Non-class based Provider Tokens.**

Provide a token and any value:

```tsx
@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    { provide: COFFEE_BRANDS, useValue: ["buddy brew", "nescafe"] },
  ],
})
export class CoffeesModule {}
```

COFFEE_BRANDS is a string constant.

To use it somewhere u should inject this provider:

```tsx
@Injectable()
export class CoffeesService {
  constructor(
    @Inject(COFFEE_BRANDS) coffeeBrands: string[],
  ) {}
```

**Class Provider**

Could be useful for configs, etc. useClass syntax:

```tsx
class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController],
  providers: [
    CoffeesService,
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === "develeopment"
          ? DevelopmentConfigService
          : ProductionConfigService,
    },
  ],
})
export class CoffeesModule {}
```
