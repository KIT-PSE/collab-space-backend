import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Note } from './note.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { Room } from '../room/room.entity';

/**
 * A service responsible for managing notes.
 */
@Injectable()
export class NoteService {
  /**
   * Initializes the NoteService.
   * @param em - The EntityManager instance provided by MikroORM.
   * @param repository - The repository for the Note entity.
   */
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Note)
    private readonly repository: EntityRepository<Note>,
  ) {}

  /**
   * Adds a new note to the specified room.
   * @param room - The room in which the note will be added.
   * @param name - The name of the note.
   * @returns The newly created Note entity.
   */
  public async addNote(room: Room, name: string) {
    const note = new Note(name, room);
    await this.em.persistAndFlush(note);
    return note;
  }

  /**
   * Updates the content of a note with the specified ID.
   * @param id - The ID of the note to update.
   * @param content - The new content for the note.
   * @returns The updated Note entity.
   * @throws EntityNotFoundException if the note with the given ID does not exist.
   */
  public async updateNote(id: number, content: string) {
    const note = await this.repository.findOneOrFail({ id });
    note.content = content;
    await this.em.persistAndFlush(note);
    return note;
  }

  /**
   * Deletes a note with the specified ID.
   * @param id - The ID of the note to delete.
   * @returns `true` if the note was successfully deleted.
   * @throws EntityNotFoundException if the note with the given ID does not exist.
   */
  public async deleteNoteById(id: number) {
    const note = await this.repository.findOneOrFail({ id });
    await this.em.removeAndFlush(note);
    return true;
  }
}
