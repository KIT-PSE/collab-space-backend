import { Note } from './note.entity';
import { Room } from '../room/room.entity';
import { Category } from '../category/category.entity';

describe('Note Entity', () => {
  let room: Room;

  beforeEach(() => {
    room = new Room('Test Room', new Category('Test Category', undefined));
  });

  it('should be able to create an instance', () => {
    const note = new Note('Test Note', room);

    expect(note).toBeDefined();
    expect(note.name).toEqual('Test Note');
    expect(note.room).toEqual(room);
  });

  it('should set default dates on creation', () => {
    const note = new Note('Test Note', room);
    const currentDate = new Date();

    expect(note.createdAt.getTime()).toBeLessThanOrEqual(currentDate.getTime());
    expect(note.updatedAt.getTime()).toBeLessThanOrEqual(currentDate.getTime());
  });
});
