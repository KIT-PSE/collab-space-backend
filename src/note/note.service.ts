import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Note } from './note.entity';
import { EntityRepository } from '@mikro-orm/mysql';
import { RoomService } from '../room/room.service';

@Injectable()
export class NoteService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Note)
    private readonly repository: EntityRepository<Note>,
    private readonly roomService: RoomService,
  ) {}

  public async addNote(roomId: number, name: string) {
    const room = await this.roomService.findOneWithCategory(roomId);
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

  public async getNotes(roomId: number) {
    const room = await this.roomService.findOneWithCategory(roomId);
    const notes = await this.repository.find({ room });
    return notes;
  }
}
