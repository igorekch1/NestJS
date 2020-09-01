import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToMany,
} from 'typeorm';

import { Flavor } from './flavor.entity';

// @Entity('coffees') sql table === 'coffees'
@Entity() // sql table === 'coffee'
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ default: 0 })
  recomendations: number;

  @JoinTable()
  @ManyToMany(
    _ => Flavor,
    flavor => flavor.coffees,
    {
      cascade: true, // ['insert']
    },
  )
  flavors: Flavor[];
}
