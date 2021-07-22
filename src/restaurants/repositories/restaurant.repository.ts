import { EntityRepository, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { Category } from '../entities/category.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async findWithPagination(
    page: number,
    itemNumber: number,
    category?: Category,
  ): Promise<[Restaurant[], number]> {
    if (category) {
      const [restaurants, totalResults] = await this.findAndCount({
        where: {
          category,
        },
        take: itemNumber,
        skip: (page - 1) * itemNumber,
        order: {
          isPromoted: 'DESC', // isPromoted : true 가 위에 나오게 정렬
        },
      });
      return [restaurants, totalResults];
    } else {
      const [restaurants, totalResults] = await this.findAndCount({
        take: itemNumber,
        skip: (page - 1) * itemNumber,
        order: {
          isPromoted: 'DESC', // isPromoted : true 가 위에 나오게 정렬
        },
      });
      return [restaurants, totalResults];
    }
  }
}
