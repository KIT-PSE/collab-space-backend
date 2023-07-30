import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Note } from './note.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { RoomService } from '../room/room.service';
import { Room } from '../room/room.entity';

@Injectable()
export class NoteService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Note)
    private readonly repository: EntityRepository<Note>,
  ) {}

  public async addNote(room: Room, name: string) {
    const note = new Note(name, room);
    await this.em.persistAndFlush(note);
    return note;
  }

  public async updateNote(id: number, content: string) {
    const note = await this.repository.findOneOrFail({ id });
    note.content = content;
    await this.em.persistAndFlush(note);
    return note;
  }

  public async deleteNoteById(id: number) {
    const note = await this.repository.findOneOrFail({ id });
    await this.em.removeAndFlush(note);
    return true;
  }
}
