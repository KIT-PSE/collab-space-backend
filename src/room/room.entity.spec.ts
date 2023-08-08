import { Room } from './room.entity';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';

describe('Room Entity', () => {
  let category: Category;

  beforeEach(() => {
    category = new Category(
      'TestCategory',
      new User('TestUser', 'test@example.com', 'Test Organization', 'password'),
    );
  });

  it('should be able to create a Room instance', () => {
    const room = new Room('TestRoom', category);
    expect(room).toBeInstanceOf(Room);
    expect(room.name).toBe('TestRoom');
    expect(room.category).toBe(category);
    expect(room.password).toBeUndefined();
  });

  it('should be able to set an optional password during creation', () => {
    const room = new Room('TestRoom', category, 'securepassword');
    expect(room.password).toBe('securepassword');
  });

  it('should initialize with the current date as createdAt and updatedAt', () => {
    const mockDate = new Date(2022, 0, 1, 10); // Mocking a date
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    const room = new Room('TestRoom', category);
    expect(room.createdAt).toEqual(mockDate);
    expect(room.updatedAt).toEqual(mockDate);
  });

  it('should return a proper string representation', () => {
    const room = new Room('TestRoom', category);
    room.id = 123; // Mocking an id for demonstration.
    expect(room.toString()).toBe('Room{123: "TestRoom"}');
  });
});
