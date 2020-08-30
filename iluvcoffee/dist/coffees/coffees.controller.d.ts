import { HttpException } from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
export declare class CoffeesController {
    private readonly coffeesService;
    constructor(coffeesService: CoffeesService);
    findAllFlavours(): string;
    findAll(paginationQuery: any): Array<Coffee>;
    findOne(id: string): Coffee | HttpException;
    createOne(createCoffeeDto: CreateCoffeeDto): CreateCoffeeDto;
    update(id: string, body: UpdateCoffeeDto): void;
    remove(id: string): void;
}
