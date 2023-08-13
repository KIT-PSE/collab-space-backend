import { User } from '../../user/user.entity';
import { Category } from '../category.entity';

export class MockCategoryService {
  constructor(
    private readonly testUser: User,
    private readonly testCategory: Category,
  ) {}

  public async get(id: number, owner: User) {
    if (id === 1 && owner === this.testUser) {
      return Promise.resolve(this.testCategory);
    }
    throw new Error('Category not found');
  }
}
