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

  public async allFromUser(user: User) {
    if (user.id === 1) {
      return Promise.resolve(this.testCategories);
    }
    return Promise.resolve([]);
  }

  public async create(name: string, owner: User) {
    const category = new Category(name, owner);
    return Promise.resolve(category);
  }

  public async update(id: number, owner: User, name: string) {
    const category = this.testCategories.find((c) => c.id === id);
    if (category && category.owner === owner) {
      category.name = name;
      return Promise.resolve(category);
    } else {
      throw new Error('Category not found');
    }
  }

  public async delete(id: number, owner: User) {
    const category = this.testCategories.find((c) => c.id === id);
    if (category && category.owner === owner) {
      this.testCategories.splice(this.testCategories.indexOf(category), 1);
      return Promise.resolve(category);
    } else {
      throw new Error('Category not found');
    }
  }
}
