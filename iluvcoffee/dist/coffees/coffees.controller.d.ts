import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
export declare class CoffeesController {
    private readonly coffeesService;
    constructor(coffeesService: CoffeesService);
    findAllFlavours(): string;
    findAll(paginationQuery: any): Array<Coffee>;
    findOne(id: string): Coffee;
    createOne(body: string): void;
    update(id: string, body: any): void;
    remove(id: string): void;
}
