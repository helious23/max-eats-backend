import { PaymentService } from './payments.service';
import { Mutation, Resolver } from '@nestjs/graphql';
import { Payment } from './entities/payment.entity';
import {
  CreatePaymentOutput,
  CreatePaymentInput,
} from './dtos/create-payment.dto';

@Resolver(of => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(returns => CreatePaymentOutput)
  createPayment(
    createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(createPaymentInput);
  }
}
