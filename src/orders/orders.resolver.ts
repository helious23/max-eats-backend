import { Order } from './entities/order.entity';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { OrderService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';

@Resolver(of => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(returns => CreateOrderOutput)
  @Role(['Client'])
  createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return;
  }
}
