import { User } from '../user.entity';

export class MockUserRepository {
  constructor(private readonly testUser: User) {}

  public async findOne({ id, email }): Promise<User | null> {
    if (id === 1 || email === 'test@example.com') {
      return Promise.resolve(this.testUser);
    }
    return Promise.resolve(null);
  }

  public async findAll(): Promise<User[]> {
    return Promise.resolve([
      new User('Test User 1', 'test1@example.com', 'Test Org', 'password'),
      new User('Test User 2', 'test2@example.com', 'Test Org', 'password'),
    ]);
  }

  public async find(ids: number[]): Promise<User[]> {
    const result: User[] = [];
    if (ids.includes(1)) {
      result.push(this.testUser);
    }
    if (ids.includes(2)) {
      result.push(
        new User('Test User 2', 'test2@example.com', 'Test Org', 'password'),
      );
    }
    return Promise.resolve(result);
  }

  public async nativeDelete({ id }: { id: number }): Promise<number> {
    if (id === 1) {
      return Promise.resolve(1);
    }
    return Promise.resolve(0);
  }
}
