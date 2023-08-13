import { Category } from '../../category/category.entity';
import { Room } from '../room.entity';

export class MockRoomRepository {
  constructor(
    private readonly testCategory: Category,
    private readonly testRoom: Room,
  ) {}

  public async findOneOrFail({
    id,
    category,
  }: {
    id: number;
    category: Category;
  }): Promise<Room> {
    if (
      (id === 1 && category === undefined) ||
      (id === 1 && category === this.testRoom.category)
    ) {
      return Promise.resolve(this.testRoom);
    } else {
      throw new Error('Room not found');
    }
  }

  public async findOne({ id }: { id: number }): Promise<Room | null> {
    if (id === 1) {
      return Promise.resolve(this.testRoom);
    } else {
      return Promise.resolve(null);
    }
  }

  public async nativeDelete({ id }: { id: number }): Promise<number> {
    if (id === 1) {
      return Promise.resolve(1);
    } else {
      throw new Error('Room not found');
    }
  }
}
