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
} from '@nestjs/common';

@Controller('coffees')
export class CoffeesController {
  @Get('/flavors')
  findAll(): string {
    return 'This action returns all coffees';
  }

  @Get(':id')
  findOne(@Param() params: { id: string }): string {
    return `This action returns #${params.id} coffee`;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createOne(@Body('name') body: string): string {
    return body;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any): string {
    return `This action updates #${id} coffee`;
  }

  @Delete(':id')
  remove(@Param('id') id: string): string {
    return `This action removes #${id} coffee`;
  }
}
