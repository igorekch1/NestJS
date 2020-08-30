import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
  Query,
  HttpException,
  NotFoundException,
} from '@nestjs/common';

import { CoffeesService } from './coffees.service';
import { Coffee } from './entities/coffee.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get('/flavors')
  findAllFlavours(): string {
    return 'This action returns all coffee falvors';
  }

  @Get()
  findAll(@Query() paginationQuery): Array<Coffee> {
    const { limit, offset } = paginationQuery;

    return this.coffeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Coffee | HttpException {
    const coffee = this.coffeesService.findOne(id);

    if (!coffee) {
      // throw new HttpException(`Coffee #${id}, not found`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`Coffee #${id}, not found`);
    }

    return coffee;
  }

  @Post()
  createOne(@Body() createCoffeeDto: CreateCoffeeDto): CreateCoffeeDto {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCoffeeDto): void {
    return this.coffeesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    return this.coffeesService.remove(id);
  }
}
