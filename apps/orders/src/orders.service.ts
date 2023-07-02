import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderRequest } from './dto/create-order.request';
import { OrdersRepository } from './orders.repository';
import { BILLING_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    @Inject(BILLING_SERVICE) private bilingClient: ClientProxy,
  ) {}
  async createOrder(request: CreateOrderRequest, authentication: string) {
    const session = await this.ordersRepository.startTransaction();
    try {
      const order = await this.ordersRepository.create(request, { session });
      //convert an observable into a Promise
      await lastValueFrom(
        this.bilingClient.emit('order_created', {
          request,
          Authentication: authentication,
        }),
      );
      await session.commitTransaction();
      return order;
    } catch (err) {
      //atomic transaction
      await session.abortTransaction();
    }
  }

  async getOrders() {
    return this.ordersRepository.find({});
  }
}
