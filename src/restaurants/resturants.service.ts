import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dto';
import { User } from '../users/entities/user.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import { Dish } from './entities/dish.entity';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import { RestaurantRepository } from './repositories/restaurant.repository';
import {
  MyRestaurantsOutput,
  MyRestaurantsInput,
} from './dtos/my-restaurants.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';

@Injectable() // resolver 에 constructor 로 inject 할 수 있게 함
export class RestaurantService {
  constructor(
    private readonly restaurants: RestaurantRepository,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
    private readonly categories: CategoryRepository, // custom repository
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner; // input 에는 owner 정보가 X login한 User 로 부터 받아옴
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
        restaurantId: newRestaurant.id,
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 등록하지 못했습니다',
      };
    }
  }

  async myRestaurants(
    owner: User,
    { page }: MyRestaurantsInput,
  ): Promise<MyRestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { owner },
        take: 9,
        skip: (page - 1) * 9,
      });

      return {
        ok: true,
        totalResults,
        totalPages: Math.ceil(totalResults / 9),
        restaurants,
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 찾을 수 없습니다',
      };
    }
  }

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { owner, id },
        { relations: ['menu'] },
      );
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 찾지 못했습니다',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾을 수 없습니다',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '자신이 등록한 식당만 수정할 수 있습니다',
        };
      }
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        // update 시에는 Array 를 넘겨줘야됨
        {
          id: editRestaurantInput.restaurantId, // id가 없으면 새로운 entity 생성함
          ...editRestaurantInput,
          ...(category && { category }), // category 가 있을 때만 update
        },
      ]);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 수정할 수 없습니다',
      };
    }
  }

  async deleteRestaurnat(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾을 수 없습니다',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '자신이 등록한 식당만 삭제할 수 있습니다',
        };
      }
      await this.restaurants.delete(restaurantId);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 삭제할 수 업습니다',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 볼 수 없습니다.',
      };
    }
  }

  countRestaurant(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: '카테고리를 찾을 수 없습니다',
        };
      }
      const [restaurants, totalResults] =
        await this.restaurants.findWithPagination(page, 9, category);
      category.restaurants = restaurants;

      return {
        ok: true,
        category,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 9),
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 불러오지 못했습니다',
      };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurants.findWithPagination(
        page,
        9,
      );
      return {
        ok: true,
        results,
        totalPages: Math.ceil(totalResults / 9),
        totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 불러오지 못했습니다',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'], // restaurant 을 볼 때 menu 도 볼 수 있게 relations 걸어줌
      });
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾지 못했습니다',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당을 찾지 못했습니다',
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Raw(name => `${name} ILIKE '%${query}%'`),
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      return {
        ok: true,
        restaurants,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (error) {
      return {
        ok: false,
        error: '식당 검색을 하지 못했습니다',
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.resturantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: '식당을 찾지 못했습니다',
        };
      }
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '자신이 등록한 식당의 메뉴만 만들수 있습니다',
        };
      }
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '메뉴를 만들지 못했습니다',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: '메뉴를 찾을 수 없습니다.',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '자신이 등록한 식당의 메뉴만 수정할 수 있습니다',
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '메뉴를 수정하지 못했습니다',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'], // dish.restaurant.ownerId 값이 필요하므로 dish 에서 restaurant 를 불러와야됨
      });
      if (!dish) {
        return {
          ok: false,
          error: '메뉴를 찾을 수 없습니다',
        };
      }
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '자신이 등록한 식당의 메뉴만 삭제할 수 있습니다',
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '메뉴를 삭제하지 못했습니다.',
      };
    }
  }
}
