import { Controller, Get } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Ctx, RmqContext, EventPattern, Payload } from '@nestjs/microservices';
import { RmqService } from '@app/common';

@Controller()
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly rmqService: RmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.billingService.getHello();
  }
  //this is a rabbit mq event controller data is the payload and ctx is the req and res info
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    this.billingService.bill(data);
    this.rmqService.ack(context);
  }
}
