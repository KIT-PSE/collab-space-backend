import { User } from '../../user/user.entity';
import { Category } from '../../category/category.entity';
import { Room } from '../room.entity';

export class MockRoomService {
  constructor(
    private readonly testCategory: Category,
    private readonly testRoom: Room,
  ) {}

  public async create(
    name: string,
    category: Category,
    password?: string,
  ): Promise<Room> {
    return Promise.resolve({
      ...this.testRoom,
      name,
      category,
      password,
    });
  }

  public async update(id: number, category: Category, name: string) {
    if (id === 1 && category === this.testCategory) {
      return Promise.resolve({
        ...this.testRoom,
        name,
      });
    }
    throw new Error('Room not found');
  }

  public async delete(id: number, category: Category) {
    if (id === 1 && category === this.testCategory) {
      return Promise.resolve(1);
    }
    throw new Error('Room not found');
  }

  public async getNotes(id: number) {
    if (id === 1) {
      return Promise.resolve(this.testRoom.notes);
    }
    throw new Error('Room not found');
  }
}
