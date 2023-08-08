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

  it('should initialize with the current date as createdAt and updatedAt', () => {
    const mockDate = new Date(2023, 0, 1, 10); // Mocking a date
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const category = new Category('TestCategory', user);
    expect(category.createdAt).toEqual(mockDate);
    expect(category.updatedAt).toEqual(mockDate);
  });
});
