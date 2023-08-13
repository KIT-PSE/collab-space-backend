import { User } from '../../user/user.entity';

export class MockCategoryRepository {
  constructor(private readonly testUser: User) {}

  public async findOneOrFail(data) {
    if (data.id === 1) {
      return Promise.resolve({
        id: 1,
        name: 'Test Category',
        owner: this.testUser,
        rooms: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      throw new Error('Category not found');
    }
  }
}
