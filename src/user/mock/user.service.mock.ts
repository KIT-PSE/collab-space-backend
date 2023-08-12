import { User } from '../user.entity';
import { EditUser } from '../user.controller';

export class MockUserService {
  constructor(private readonly testUser: User) {}

  public async findAll(): Promise<User[]> {
    return Promise.resolve([
      new User('Test User 1', 'test1@example.com', 'Test Org', 'password'),
      new User('Test User 2', 'test2@example.com', 'Test Org', 'password'),
    ]);
  }

  public async changeRole(id: number): Promise<User> {
    if (id === 1) {
      this.testUser.role = this.testUser.role === 'user' ? 'admin' : 'user';
      return Promise.resolve(this.testUser);
    }
    throw new Error('User not found');
  }

  public async changeUserData(data: EditUser): Promise<boolean> {
    if (data.id === 1) {
      this.testUser.name = data.name;
      this.testUser.email = data.email;
      this.testUser.organization = data.organization;
      return Promise.resolve(true);
    }
    throw new Error('User not found');
  }

  public async delete(id: number): Promise<number> {
    if (id === 1) {
      return Promise.resolve(1);
    }
    throw new Error('User not found');
  }

  public async changePassword(): Promise<void> {
    //
  }
}
