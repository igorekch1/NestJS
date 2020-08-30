import { Injectable } from '@nestjs/common';

import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  private coffees: Array<Coffee> = [
    {
      id: 1,
      name: 'Shipwrech Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];

  public findAll() {
    return this.coffees;
  }

  public findOne(id: string) {
    return this.coffees.find(coffee => coffee.id === +id);
  }

  public create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);

    return createCoffeeDto;
  }

  public update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);

    if (existingCoffee) {
      //    update the existing coffee
    }
  }

  public remove(id: string) {
    const coffeeIndex = this.coffees.findIndex(item => item.id === +id);

    if (coffeeIndex >= 0) {
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}
