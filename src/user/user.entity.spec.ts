import { User } from './user.entity';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user with correct properties', () => {
      const name = 'Test User';
      const email = 'test@example.com';
      const organization = 'Test Org';
      const password = 'password';

      const user = new User(name, email, organization, password);

      expect(user.name).toBe(name);
      expect(user.email).toBe(email);
      expect(user.organization).toBe(organization);
      expect(user.password).toBe(password);
    });
  });

  it('should set role to user by default', () => {
    const user = new User(
      'Test User',
      'test@example.com',
      'Test Org',
      'password',
    );

    expect(user.role).toBe('user'); // Default value
  });

  it('should set default dates on creation', () => {
    const user = new User(
      'Test User',
      'test@example.com',
      'Test Org',
      'password',
    );
    const currentDate = new Date();

    expect(user.createdAt.getTime()).toBeLessThanOrEqual(currentDate.getTime());
    expect(user.updatedAt.getTime()).toBeLessThanOrEqual(currentDate.getTime());
  });
});
