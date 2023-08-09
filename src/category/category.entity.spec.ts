import { Category } from './category.entity';
import { User } from '../user/user.entity';

describe('Category Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User(
      'Test User',
      'test@example.com',
      'Test Organization',
      'password',
    );
  });

  it('should be able to create a Category instance', () => {
    const category = new Category('TestCategory', user);
    expect(category).toBeInstanceOf(Category);
    expect(category.name).toBe('TestCategory');
    expect(category.owner).toBe(user);
  });

  it('should initialize with an empty rooms collection', () => {
    const category = new Category('TestCategory', user);
    expect(category.rooms).toHaveLength(0);
  });

  it('should set default dates on creation', () => {
    const category = new Category('TestCategory', user);
    const currentDate = new Date();

    expect(category.createdAt.getTime()).toBeLessThanOrEqual(
      currentDate.getTime(),
    );
    expect(category.updatedAt.getTime()).toBeLessThanOrEqual(
      currentDate.getTime(),
    );
  });
});
