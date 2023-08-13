import { Note } from '../note.entity';

export class MockNoteRepository {
  public async findOneOrFail({ id }: { id: number }): Promise<Note> {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        name: 'Test Note',
        content: 'Test Note Content',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Note);
    }
    throw new Error('Note not found');
  }
}
