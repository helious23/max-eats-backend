import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from '../../common/dtos/output.dto';

@InputType()
export class CheckRestaurantInput extends PickType(Restaurant, ['name']) {}

@ObjectType()
export class CheckRestaurantOutput extends CoreOutput {}
