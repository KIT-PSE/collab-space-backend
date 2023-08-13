import { User } from '../../user/user.entity';
import { Category } from '../category.entity';

export class MockCategoryService {
  constructor(private readonly testCategories: Category[]) {}

  public async get(id: number, owner: User) {
    const category = this.testCategories.find((c) => c.id === id);
    if (category && category.owner === owner) {
      return Promise.resolve(category);
    } else {
      throw new Error('Category not found');
    }
  }
}
