import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { CoffeesService } from './coffees.service';
// Controllers
import { CoffeesController } from './coffees.controller';
// Entities
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from './events/entities/event.entity';
import { COFFEE_BRANDS } from './coffees.contanstas';

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {}

@Module({
  imports: [TypeOrmModule.forFeature([Coffee, Flavor, Event])],
  controllers: [CoffeesController],
  // providers: [CoffeesService]
  providers: [
    CoffeesService,
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'develeopment'
          ? DevelopmentConfigService
          : ProductionConfigService,
    },
    { provide: COFFEE_BRANDS, useValue: ['buddy brew', 'nescafe'] },
  ],
  // providers: [{ provide: CoffeesService, useValue: new MockCoffeeService() }], // Valuse base Provider
})
export class CoffeesModule {}
