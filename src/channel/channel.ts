import { Server, Socket } from 'socket.io';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';
import { WsException } from '@nestjs/websockets';

export interface ChannelUser {
  client: Socket;
  video: boolean;
  audio: boolean;
}

export interface Teacher extends ChannelUser {
  user: User;
}

export interface Student extends ChannelUser {
  name: string;
}

export class Channel {
  public teacher?: Teacher;
  public readonly students: Student[] = [];

  constructor(
    public readonly room: Room,
    public readonly server: Server,
    public readonly id: string,
  ) {}

  public async joinAsStudent(client: Socket, name: string) {
    await client.join(this.id);
    this.students.push({ name, client, video: true, audio: true });

    client.broadcast.to(this.id).emit('student-joined', {
      id: client.id,
      name,
      video: true,
      audio: true,
    });
  }

  public async joinAsTeacher(client: Socket, user: User) {
    if (this.teacher) {
      await this.leaveAsTeacher(this.teacher.client);
    }

    await client.join(this.id);
    this.teacher = { user, client, video: true, audio: true };

    client.broadcast.to(this.id).emit('teacher-joined', {
      id: client.id,
      user,
      video: true,
      audio: true,
    });
  }

  public async leaveAsTeacher(client: Socket) {
    await client.leave(this.id);
    this.teacher = undefined;

    client.broadcast.to(this.id).emit('teacher-left', {});
  }

  public async leaveAsStudent(client: Socket) {
    await client.leave(this.id);
    const index = this.students.findIndex((s) => s.client.id === client.id);

    if (index < 0) {
      return;
    }

    this.students.splice(index, 1);

    client.broadcast.to(this.id).emit('student-left', client.id);
  }

  public isEmpty(): boolean {
    return !this.teacher && this.students.length === 0;
  }

  public close() {
    this.server.emit('room-closed', this.room.id);
  }

  public getUser(clientId: string): Teacher | Student {
    if (this.teacher && this.teacher.client.id === clientId) {
      return this.teacher;
    }

    const student = this.students.find((s) => s.client.id === clientId);

    if (student) {
      return student;
    }

    throw new WsException(`User not found in ${this}`);
  }

  public changeName(client: Socket, name: string) {
    const student = this.students.find((s) => s.client.id === client.id);

    if (student) {
      student.name = name;
    }
  }

  public updateWebcam(client: Socket, video: boolean, audio: boolean) {
    const user = this.getUser(client.id);

    if (user) {
      user.video = video;
      user.audio = audio;
    }
  }

  public toString(): string {
    return `Channel{${this.id}}`;
  }
}
