import { Server, Socket } from 'socket.io';
import { User } from '../user/user.entity';
import { Room } from '../room/room.entity';
import { WsException } from '@nestjs/websockets';
import { fabric } from 'fabric';

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
  handSignal: boolean;
}

export class Channel {
  public teacher?: Teacher;
  private closeTimeout: NodeJS.Timeout;

  public students: Map<string, Student> = new Map();

  constructor(
    public readonly room: Room,
    public readonly server: Server,
    public readonly id: string,
    public canvas: fabric.Canvas,
  ) {}

  public async joinAsStudent(client: Socket, name: string) {
    await client.join(this.id);

    const student = {
      name,
      client,
      video: true,
      audio: true,
      handSignal: false,
    };
    this.students.set(client.id, student);

    client.broadcast.to(this.id).emit('student-joined', {
      id: client.id,
      name: student.name,
      video: true,
      audio: true,
      handSignal: false,
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
    const student = this.students.get(client.id);

    if (student) {
      delete student.client;
      this.students.delete(client.id);

      await client.leave(this.id);
      client.broadcast.to(this.id).emit('student-left', client.id);
    }
  }

  public isEmpty(): boolean {
    return !this.teacher && this.students.size === 0;
  }

  public close() {
    this.server.emit('room-closed', this.room.id);
  }

  public getUser(clientId: string): Teacher | Student {
    if (this.teacher && this.teacher.client.id === clientId) {
      return this.teacher;
    }

    const student = this.students.get(clientId);

    if (student) {
      return student;
    }

    throw new WsException(`User not found in ${this}`);
  }

  public getStudent(clientId: string): Student {
    const student = this.students.get(clientId);

    if (student) {
      return student;
    }

    throw new WsException(`User not found in ${this}`);
  }

  public changeName(client: Socket, name: string) {
    const student = this.students.get(client.id);

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

  public updateHandSignal(client: Socket, handSignal: boolean) {
    const student = this.getStudent(client.id);

    if (student) {
      student.handSignal = handSignal;
    }
  }

  public toString(): string {
    return `Channel{${this.id}}`;
  }

  public clearCloseTimeout() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
  }

  public setCloseTimeout(onTimeout: () => void) {
    this.clearCloseTimeout();
    this.closeTimeout = setTimeout(() => {
      if (this.isEmpty()) {
        this.close();
        onTimeout();
      }
    }, 1000 * 60 * 10);
  }
}
