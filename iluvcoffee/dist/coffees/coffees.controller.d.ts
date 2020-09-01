import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
export declare class CoffeesController {
    private readonly coffeesService;
    constructor(coffeesService: CoffeesService);
    findAllFlavours(): string;
    findAll(paginationQuery: PaginationQueryDto): Promise<Array<Coffee>>;
    findOne(id: string): Promise<Coffee>;
    createOne(createCoffeeDto: CreateCoffeeDto): Promise<Coffee>;
    update(id: string, body: UpdateCoffeeDto): Promise<Coffee>;
    remove(id: string): Promise<Coffee>;
}
