import * as crypto from 'crypto';
import { Server, Socket } from 'socket.io';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';

export interface Teacher {
  user: User;
  client: Socket;
}

export interface Student {
  id: string;
  name: string;
  client: Socket;
}

export class Channel {
  public readonly id: string;
  public teacher?: Teacher;
  public readonly students: Student[] = [];

  constructor(
    public readonly room: Room,
    user: User,
    client: Socket,
    public readonly server: Server,
  ) {
    // TODO: change id to be a 6 digit random number instead of a UUID to make it easier to type
    this.id = crypto.randomUUID();
    this.teacher = { user, client };
    client.join(this.id);
  }

  public async joinAsStudent(client: Socket, name: string) {
    await client.join(this.id);
    this.students.push({ id: client.id, name, client });

    client.broadcast
      .to(this.id)
      .emit('student-joined', { id: client.id, name });
  }

  public async joinAsTeacher(client: Socket, user: User) {
    if (this.teacher) {
      await this.leaveAsTeacher(this.teacher.client);
    }

    await client.join(this.id);
    this.teacher = { user, client };

    client.broadcast.to(this.id).emit('teacher-joined', user);
  }

  public async leaveAsTeacher(client: Socket) {
    await client.leave(this.id);
    this.teacher = undefined;

    client.broadcast.to(this.id).emit('teacher-left', {});
  }

  public async leaveAsStudent(client: Socket) {
    await client.leave(this.id);
    const index = this.students.findIndex((s) => s.id === client.id);

    if (index < 0) {
      return;
    }

    this.students.splice(index, 1);

    client.broadcast.to(this.id).emit('student-left', client.id);
  }

  public isEmpty(): boolean {
    return !this.teacher && this.students.length === 0;
  }

  public toString(): string {
    return `Channel{${this.id}}`;
  }
}
