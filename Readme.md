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

### Dynamic modules

Example:

1. create a static method:

```tsx
import { Module, DynamicModule } from "@nestjs/common";
import { createConnection, ConnectionOptions } from "typeorm";

@Module({})
export class DatabaseModule {
  static register(options: ConnectionOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: "CONNECTION",
          useValue: createConnection(options),
        },
      ],
    };
  }
}
```

2. Pass a module invoking a static method:

```tsx
import { Module } from "@nestjs/common";

import { DatabaseModule } from "src/database/database.module";

@Module({
  imports: [
    DatabaseModule.register({
      type: "postgres",
      host: "localhost",
      password: "password",
    }),
  ],
  providers: [],
})
export class CoffeeRatingModule {}
```

**Control providers scope:**

Each provider is a singleton. To change its scope pass it to the @Injectable decorator:

```tsx
@Injectable({ scope: Scope.DEFAULT }) // By default
```

- Scope.TRANSIENT - are not shared across consumers. This consumer will receive a new instance of this provider.
- Scope.REQUEST - new instance of the provider exclusively for each incoming request. Instance is automatically garbage collected after request stops processing. The request scope provider bubbles up an injection chain, so if controller injects a request scope service then this controller becomes request scoped as well.

**useFactory**:

- Create providers dynamically based on other providers
- Delay the entire bootstrap process until one or more async tasks have completed.

### Configuration

In order to use `.env` file for application configuration install `@nestjs/config` package and enable it in the app module:

```tsx
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true, // models will be loaded automatically (you don't have to explicitly specify the entities: [] array)
      synchronize: true, // your entities will be synced with the database (ORM will map entity definitions to corresponding SQL tabled), every time you run the application (recommended: disable in the production)
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Validation schema**

```bash
yarn add @hapi/joi
yadn add -D @types/hapi__joi
```

```tsx
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "@hapi/joi";

import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_HOST: Joi.required(),
        DATABASE_PORT: Joi.number().default(5432),
      }),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true, // models will be loaded automatically (you don't have to explicitly specify the entities: [] array)
      synchronize: true, // your entities will be synced with the database (ORM will map entity definitions to corresponding SQL tabled), every time you run the application (recommended: disable in the production)
    }),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Custom env file paths:

```tsx
ConfigModule.forRoot({
      envFilePath: '.environment',
      // ignoreEnvFile: true
}),
```

**Config service:**

```tsx
@Injectable()
export class CoffeesService {
  constructor(private readonly configService: ConfigService) {
    const databaseHost = this.configService.get<string>("DATABASE_HOST");
  }
}
```

**Custom configuration**

app.config.ts

```tsx
export default () => ({
  environment: process.env.NODE_ENV || "development",
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },
});
```

app.module.ts

```tsx
ConfigModule.forRoot({
  load: [appConfig],
});
```

service.ts:

```tsx
constructor(
    private readonly configService: ConfigService,
  ) {
    const databaseHost = this.configService.get<string>('database.host');
  }
```

P**artial registration**

[module].config.ts:

```tsx
import { registerAs } from "@nestjs/config";

export default registerAs("coffees", () => ({
  foo: "bar",
}));
```

[module].service.ts:

```tsx
const coffeesConfig = this.configService.get("coffees.foo");
```

**Namespaced configuration object:**

```tsx
export class CoffeesService {
  constructor(
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>
  ) {
    console.log(coffeesConfiguration.foo)
  }
```

**Async configure dynamic modules:**

```tsx
imports: [
    ConfigModule.forRoot({
      load: [appConfig]
    }),
    CoffeesModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: +process.env.DATABASE_PORT,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true, // models will be loaded automatically (you don't have to explicitly specify the entities: [] array)
        synchronize: true, // your entities will be synced with the database (ORM will map entity definitions to corresponding SQL tabled), every time you run the application (recommended: disable in the production)
      })}),
    DatabaseModule,
  ],
```

Async config will be loaded after every module is registered in the application.

## Swagger module

Install packages:

```bash
yarn add @nestjs/swagger swagger-ui-express
```

Setting up swagger (main.ts):

```tsx
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

// bootstrap()
const options = new DocumentBuilder()
  .setTitle("Iluvcoffee")
  .setDescription("Coffee application")
  .setVersion("1.0")
  .build();

const document = SwaggerModule.createDocument(app, options);
SwaggerModule.setup("api", app, document);
```

Add to nest-cli.json:

```json
"compilerOptions": {
  "deleteOutDir": true,
  "plugins": ["@nestjs/swagger/plugin"]
}
```

Decorate Model Properties:

```tsx
// Fixing PartialType for Swagger
import { PartialType } from '@nestjs/swagger';

/**
 * @ApiProperty decorator useful to *override*
 * information automatically inferred from the @nestjs/swagger plugin
 */
@ApiProperty({ description: 'The name of a coffee.' })
```

Adding example responses:

```tsx
/**
 * Setting different API Responses for Swagger UI
 * (long version)
*/
@ApiResponse({ status: 403, description: 'Forbidden.' })

/* short-hand versions are available as well */
@ApiForbiddenResponse({ description: 'Forbidden.' })
```

## Testing

```bash
// For unit tests
npm run test

// For unit tests + collecting testing coverage
npm run test:cov

// For e2e tests
npm run test:e2e
```

### **Unit Tests**

**For unit tests In NestJS, it’s a common practice to keep the spec files in the same folder as the application source code files that they test.**

**Each controller, provider, service, etc. should have its own dedicated test file. The test file extension must be (dot).spec.ts (this is so that integrated test tooling can identify it as a test file with test suites).**

---

### **End-to-End (e2e) Tests**

**For e2e tests, these files are typically located in a dedicated `test` directory by default. e2e tests are typically grouped into separate files by the feature or functionality that they test. The file extension must be (dot).e2e-spec.ts.**

---

### **How are they different?**

**While unit tests focus on individual classes and functions…**

**e2e tests are great for high-level validation of the entire system. e2e testing covers the interaction of classes and modules at a more aggregate level -- closer to the kind of interaction that end-users will have with the production system.**

```tsx
// Run a unit test for a -specific- file pattern
npm run test:watch -- coffees.service

// Basic / empty "Mocks" for Entities in our CoffeesService
providers: [
  CoffeesService,
  { provide: Connection, useValue: {} },
  { provide: getRepositoryToken(Flavor), useValue: {} }, // 👈
  { provide: getRepositoryToken(Coffee), useValue: {} }, // 👈
]
```

**Unit test example**:

```tsx
import { Test, TestingModule } from "@nestjs/testing";
import { CoffeesService } from "./coffees.service";
import { Connection, Repository } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Flavor } from "./entities/flavor.entity";
import { Coffee } from "./entities/coffee.entity";
import { NotFoundException } from "@nestjs/common";

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
});

describe("CoffeesService", () => {
  let service: CoffeesService;
  let coffeeRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoffeesService,
        { provide: Connection, useValue: {} },
        {
          provide: getRepositoryToken(Flavor),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Coffee),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<CoffeesService>(CoffeesService);
    coffeeRepository = module.get<MockRepository>(getRepositoryToken(Coffee));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findOne", () => {
    describe("when coffee with ID exists", () => {
      it("should return the coffee object", async () => {
        const coffeeId = "1";
        const expectedCoffee = {};

        coffeeRepository.findOne.mockReturnValue(expectedCoffee);
        const coffee = await service.findOne(coffeeId);
        expect(coffee).toEqual(expectedCoffee);
      });
    });
    describe("otherwise", () => {
      it('should throw the "NotFoundException"', async (done) => {
        const coffeeId = "1";
        coffeeRepository.findOne.mockReturnValue(undefined);

        try {
          await service.findOne(coffeeId);
          done();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(`Coffee #${coffeeId} not found`);
        }
      });
    });
  });
});
```

**E2E test initial:**

```tsx
// Run e2e tests
npm run test:e2e

/*
  app.e2e-spec.ts - FINAL CODE
*/
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()) // 👈
      .get('/')
      .set('Authorization', process.env.API_KEY) // 👈
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    await app.close();
  });
});
```

**Grouping our applications functionality into Modules is strongly recommended as an effective way to organize our components. For most applications, the resulting architecture will employ multiple modules, each encapsulating a closely related set of capabilities.**

**Because of this encapsulated organization, this allows us to test each feature independently by importing a specific module (that we want to test) into our TestingModule.**

**In this lesson, we’ll be testing the “Coffees” feature we worked on throughout this course, and test some of the CRUD endpoints we provided in it so far.**

---

**💡 IMPORTANT NOTE**

**Sometimes when errors happen within npm scripts (such as the tests we're running inside test:e2e), post hooks won't run!**

**You have a few options here, when these error happen, you can:**

**1) Manually run the `posttest:e2e` hook when Jest errors happen (to make sure your database gets removed)**

**2) Use a library like `npm-run-all` (npm i --D npm-run-all) and use the --continue-on-error flag to make sure everything still runs, moving the "post" hook into an npm script to be ran, like so:**

**"pretest:e2e": "docker-compose up -d test-db",**

**"run:jest": "jest --config ./test/jest-e2e.json",**

**"test:e2e": "npm-run-all the-actual-test run-after-test-even-if-failed --continue-on-error",**

**"test:e2e:teardown": "docker-compose stop test-db && docker-compose rm -f test-db"**

```tsx
// Run e2e tests for a -specific- file pattern
npm run test:e2e -- coffees

/* 💡💡 IMPORTANT NOTE 💡💡
  Sometimes when errors happen within npm scripts (such as the tests we're
  running inside test:e2e), post hooks won't run!

  You have a few options here, when these error happen, you can:

  1) Manually run the `posttest:e2e` hook.

  2) Use a library like `npm-run-all` (npm i --D npm-run-all) and use
     the --continue-on-error flag to make sure everything still runs, moving the "post" hook
     into an npm script to be ran

  For example:

  "pretest:e2e": "docker-compose up -d test-db",
  "run:jest": "jest --config ./test/jest-e2e.json",
  "test:e2e": "npm-run-all the-actual-test run-after-test-even-if-failed --continue-on-error",
  "test:e2e:teardown": "docker-compose stop test-db && docker-compose rm -f test-db"
*/

/*
  docker-compose.yml - FINAL CODE
*/
version: "3"

services:
  db:
    image: postgres
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: pass123
  test-db:
    image: postgres
    restart: always
    ports:
      - "5433:5432" # 👈 Note the 5433 port (since we are using 5432 for our regular db)
    environment:
      POSTGRES_PASSWORD: pass123

/*
 package.json pre & post hook additions
*/

"pretest:e2e": "docker-compose up -d test-db",
"posttest:e2e": "docker-compose stop test-db && docker-compose rm -f test-db"

/*
  test/coffees/coffees.e2e-spec.ts - FINAL CODE
*/
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('[Feature] Coffees - /coffees', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pass123',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it.todo('Create [POST /]');
  it.todo('Get all [GET /]');
  it.todo('Get one [GET /:id]');
  it.todo('Update one [PATCH /:id]');
  it.todo('Delete one [DELETE /:id]');

  afterAll(async () => {
    await app.close();
  });
});
```

E2E test example:

```tsx
/* 
  test/coffees/coffees.e2e-spec.ts - FINAL CODE 
*/
import {
  INestApplication,
  ValidationPipe,
  HttpStatus,
  HttpServer,
} from "@nestjs/common";
import { TestingModule, Test } from "@nestjs/testing";
import { CoffeesModule } from "../../src/coffees/coffees.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { CreateCoffeeDto } from "src/coffees/dto/create-coffee.dto";
import { UpdateCoffeeDto } from "src/coffees/dto/update-coffee.dto";

describe("[Feature] Coffees - /coffees", () => {
  const coffee = {
    name: "Shipwreck Roast",
    brand: "Buddy Brew",
    flavors: ["chocolate", "vanilla"],
  };
  const expectedPartialCoffee = jasmine.objectContaining({
    ...coffee,
    flavors: jasmine.arrayContaining(
      coffee.flavors.map((name) => jasmine.objectContaining({ name }))
    ),
  });
  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: "postgres",
          host: "localhost",
          port: 5433,
          username: "postgres",
          password: "pass123",
          database: "postgres",
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    await app.init();
    httpServer = app.getHttpServer();
  });

  it("Create [POST /]", () => {
    return request(httpServer)
      .post("/coffees")
      .send(coffee as CreateCoffeeDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        expect(body).toEqual(expectedPartialCoffee);
      });
  });

  it("Get all [GET /]", () => {
    return request(httpServer)
      .get("/coffees")
      .then(({ body }) => {
        console.log(body);
        expect(body.length).toBeGreaterThan(0);
        expect(body[0]).toEqual(expectedPartialCoffee);
      });
  });

  it("Get one [GET /:id]", () => {
    return request(httpServer)
      .get("/coffees/1")
      .then(({ body }) => {
        expect(body).toEqual(expectedPartialCoffee);
      });
  });

  it("Update one [PATCH /:id]", () => {
    const updateCoffeeDto: UpdateCoffeeDto = {
      ...coffee,
      name: "New and Improved Shipwreck Roast",
    };
    return request(httpServer)
      .patch("/coffees/1")
      .send(updateCoffeeDto)
      .then(({ body }) => {
        expect(body.name).toEqual(updateCoffeeDto.name);

        return request(httpServer)
          .get("/coffees/1")
          .then(({ body }) => {
            expect(body.name).toEqual(updateCoffeeDto.name);
          });
      });
  });

  it("Delete one [DELETE /:id]", () => {
    return request(httpServer)
      .delete("/coffees/1")
      .expect(HttpStatus.OK)
      .then(() => {
        return request(httpServer)
          .get("/coffees/1")
          .expect(HttpStatus.NOT_FOUND);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## MongoDB

docker-compose.yml:

```yaml
version: "3"

services:
  db:
    image: mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGODB_PASSWORD: nest-course
```

Install mongoose:

```bash
yarn add mongoose @nestjs/mongoose
yarn add -D @types/mongoose
```

Setup MongooseModule in AppModule:

```tsx
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest-course’),
  ],
})
export class AppModule {}
```

Creating schema:

coffee.entity.ts:

```tsx
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Coffee extends Document {
  @Prop()
  name: string;

  @Prop()
  brand: string;

  @Prop([String])
  flavors: string[];
}

export const CoffeeSchema = SchemaFactory.createForClass(Coffee);
```

coffees.module.ts:

```tsx
/* Add Schema to MongooseModule in CoffeesModule */
MongooseModule.forFeature([
  {
    name: Coffee.name,
    schema: CoffeeSchema,
  },
]);
```

**Our Mongoose Models let us interact with MongoDB - with each Model representing a separate collection.**

**In Mongo, an instance of a model is called a Document - if you’re familiar with SQL databases - it might help to think of Documents as something similar to “Rows”.**

**There is a class from Mongoose called Model that acts as an abstraction over our datasource - exposing a variety of useful methods for interacting with the documents stored in our database.**

```tsx
/* Utilizing Mongo Coffee Model */
constructor(
  @InjectModel(Coffee.name)
  private coffeeModel: Model<Coffee>,
) {}

/* CoffeesService - FINAL CODE */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
  ) {}

  findAll() {
    return this.coffeeModel.find().exec();
  }

  async findOne(id: string) {
    const coffee = await this.coffeeModel.findOne({ _id: id }).exec();
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = new this.coffeeModel(createCoffeeDto);
    return coffee.save();
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true })
      .exec();

    if (!existingCoffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return existingCoffee;
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return coffee.remove();
  }
}
```

**Pagination**:

```bash
nest g class common/dto/pagination-query.dto --no-spec
```

pagination-query.dto.ts

```tsx
export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  limit: number;

  @IsOptional()
  @IsPositive()
  offset: number;
}
```

coffees.serive.ts

```tsx
findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeModel
      .find()
      .skip(offset)
      .limit(limit)
      .exec();
  }
```

**Transactions:**

**Let’s say that a new business requirement comes in for our application - and the product team wants users to have the ability to “recommend” different Coffees, AND whenever that occurs - we need to add a new Event to the database that can be used later for data analytics purposes.**

**So we’re going to need 2 things here:**

**We have to provide a new endpoint that allows users to recommend coffees, and we’re going to need to store the Event after the previous call finishes.**

**In order for this *whole* process to “succeed” - we need BOTH operations to be successful. Otherwise we may have inconsistencies in our database.**

**This is where “transactions” come in.**

**A database “transaction” symbolizes a unit of work performed within a database management system.**

**Transactions are a reliable way to accomplish multiple tasks independent of other transactions.**

```bash
nest g class events/entities/event.entity --no-spec
```

event.entity.ts:

```tsx
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";

@Schema()
export class Event extends mongoose.Document {
  // Note "entity" was removed from the class "name"
  @Prop()
  type: string;

  @Prop()
  name: string;

  @Prop(mongoose.SchemaTypes.Mixed)
  payload: Record<string, any>;
}

export const EventSchema = SchemaFactory.createForClass(Event);
```

coffees.service.ts:

```tsx
async recommendCoffee(coffee: Coffee) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: { coffeeId: coffee.id },
      });
      await recommendEvent.save({ session });
      await coffee.save({ session });

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
```

**Indexes**:

```tsx
// Index on a single property
@Prop({ index: true })

// Compound index referencing multiple properties
eventSchema.index({ name: 1, type: -1 })

/**
 * In this example:
 * We passed a value of 1 (to name) which specifies that the index
 * should order these items in an Ascending order.
 *
 * We passed type a value of (negative) -1 which specifies that
 * The index should order these items in Descending order.
 */
```
