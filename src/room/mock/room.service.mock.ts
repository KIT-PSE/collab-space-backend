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

  public async update(
    id: number,
    category: Category,
    name: string,
    password?: string,
  ) {
    if (id === 1 && category === this.testCategory) {
      return Promise.resolve({
        ...this.testRoom,
        name,
        password,
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

  public async findOneWithCategory(id: number) {
    if (id === this.testRoom.id) {
      return Promise.resolve(this.testRoom);
    }
    throw new Error('Room not found');
  }

  public updateWhiteboard() {
    return Promise.resolve();
  }
}
