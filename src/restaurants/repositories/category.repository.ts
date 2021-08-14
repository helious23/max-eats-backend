import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string, categoryImg?: string): Promise<Category> {
    const categoryName = name
      .trim() // 앞 뒤 공백 제거
      .toLowerCase(); // 소문자로 변환
    const categorySlug = categoryName.replace(/ +/g, '-'); // 중간 스페이스를 - 로 변환
    let category = await this.findOne({ slug: categorySlug }); // categorySlug 가 있는지 검색
    if (!category) {
      // 없으면 만듦
      category = await this.save(
        this.create({
          slug: categorySlug,
          name: categoryName,
          coverImg: categoryImg,
        }),
      );
    }
    return category;
  }
}
