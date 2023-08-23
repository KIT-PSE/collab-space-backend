import { User } from '../user.entity';
import { CreateUser, UpdateUser } from '../../auth/auth.dto';

export class MockUserService {
  constructor(private readonly testUser: User) {}

  public async findOne(id: number): Promise<User | null> {
    if (id === 1) {
      return Promise.resolve(this.testUser);
    } else {
      return Promise.resolve(null);
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    if (email === this.testUser.email) {
      return Promise.resolve(this.testUser);
    } else {
      return Promise.resolve(null);
    }
  }

  public async findAll(): Promise<User[]> {
    return Promise.resolve([
      new User('Test User 1', 'test1@example.com', 'Test Org', 'password'),
      new User('Test User 2', 'test2@example.com', 'Test Org', 'password'),
    ]);
  }

  public async create(data: CreateUser): Promise<User> {
    return Promise.resolve({
      ...this.testUser,
      ...data,
    });
  }

  public async changeRole(id: number): Promise<User> {
    if (id === 1) {
      this.testUser.role = this.testUser.role === 'user' ? 'admin' : 'user';
      return Promise.resolve(this.testUser);
    }
    throw new Error('User not found');
  }

  public async isEmailTakenNotBy(user: User, email: string): Promise<boolean> {
    if (email === this.testUser.email) {
      return Promise.resolve(false);
    } else {
      if (email.startsWith('istaken')) {
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    }
  }

  public async update(user: User, data: UpdateUser): Promise<User> {
    if (user.id === 1) {
      this.testUser.name = data.name;
      this.testUser.email = data.email;
      this.testUser.organization = data.organization;
      return Promise.resolve(this.testUser);
    }
    return Promise.resolve(user);
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
