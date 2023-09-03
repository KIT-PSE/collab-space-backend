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
  handSignal: boolean;
  permission: boolean;
}

export interface Settings {
  globalMute: boolean;
}

/**
 * Represents a channel for a room in the application.
 */
export class Channel {
  public teacher?: Teacher;
  private closeTimeout: NodeJS.Timeout;

  public students: Map<string, Student> = new Map();

  public canvasJSON: string;

  public settings: Settings = {
    globalMute: false,
  };

  /**
   * Creates a new Channel instance.
   *
   * @param room - The room associated with the channel.
   * @param server - The socket server instance.
   * @param id - The ID of the channel.
   */
  constructor(
    public readonly room: Room,
    public readonly server: Server,
    public readonly id: string,
  ) {
    this.canvasJSON = room.whiteboardCanvas?.toString();
  }

  /**
   * Joins a client as a student to the channel.
   *
   * @param client - The client socket.
   * @param name - The name of the student.
   */
  public async joinAsStudent(client: Socket, name: string) {
    await client.join(this.id);

    const student = {
      name,
      client,
      video: true,
      audio: true,
      handSignal: false,
      permission: false,
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

  /**
   * Joins a client as a teacher to the channel.
   *
   * @param client - The client socket.
   * @param user - The teacher's user object.
   */
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

  /**
   * Removes the teacher from the channel.
   *
   * @param client - The client socket of the teacher.
   */
  public async leaveAsTeacher(client: Socket) {
    await client.leave(this.id);
    this.teacher = undefined;

    client.broadcast.to(this.id).emit('teacher-left', {});
  }

  /**
   * Removes a student from the channel.
   *
   * @param client - The client socket of the student.
   */
  public async leaveAsStudent(client: Socket) {
    const student = this.students.get(client.id);

    if (student) {
      delete student.client;
      this.students.delete(client.id);

      await client.leave(this.id);
      client.broadcast.to(this.id).emit('student-left', client.id);
    }
  }

  /**
   * Checks if the channel is empty (no teacher or students).
   *
   * @returns `true` if the channel is empty, `false` otherwise.
   */
  public isEmpty(): boolean {
    return !this.teacher && this.students.size === 0;
  }

  /**
   * Notifies the server that the room is closing.
   */
  public close() {
    this.server.emit('room-closed', this.room.id);
  }

  /**
   * Gets the user (teacher or student) associated with the given client ID.
   *
   * @param clientId - The ID of the client.
   * @returns The user object (teacher or student).
   * @throws `WsException` if the user is not found.
   */
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

  /**
   * Gets the student associated with the given client ID.
   *
   * @param clientId - The ID of the client.
   * @returns The student object.
   * @throws `WsException` if the student is not found.
   */
  public getStudent(clientId: string): Student {
    const student = this.students.get(clientId);

    if (student) {
      return student;
    }

    throw new WsException(`User not found in ${this}`);
  }

  /**
   * Changes the name of a student.
   *
   * @param client - The client socket of the student.
   * @param name - The new name.
   */
  public changeName(client: Socket, name: string) {
    const student = this.students.get(client.id);

    if (student) {
      student.name = name;
    }
  }

  /**
   * Updates the webcam settings of a user (teacher or student).
   *
   * @param client - The client socket of the user.
   * @param video - The new video setting.
   * @param audio - The new audio setting.
   */
  public updateWebcam(client: Socket, video: boolean, audio: boolean) {
    const user = this.getUser(client.id);

    if (user) {
      user.video = video;
      user.audio = audio;
    }
  }

  public disableAudioFor(studentId: string) {
    const student = this.getStudent(studentId);

    if (student) {
      student.audio = false;
    }
  }

  /**
   * Updates the hand signal setting of a student.
   *
   * @param client - The client socket of the student.
   * @param handSignal - The new hand signal setting.
   */
  public updateHandSignal(client: Socket, handSignal: boolean) {
    const student = this.getStudent(client.id);

    if (student) {
      student.handSignal = handSignal;
    }
  }

  /**
   * Updates the permission setting of a student.
   *
   * @param studentId - The ID of the student.
   * @param permission - The new permission setting.
   */
  public updatePermission(studentId: string, permission: boolean) {
    const student = this.getStudent(studentId);

    if (student) {
      student.permission = permission;
    }
  }

  /**
   * Returns a string representation of the channel.
   *
   * @returns The string representation.
   */
  public toString(): string {
    return `Channel{${this.id}}`;
  }

  /**
   * Clears the close timeout if set.
   */
  public clearCloseTimeout() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
  }

  /**
   * Sets a timeout to close the channel if it becomes empty after a period of time.
   *
   * @param onTimeout - The callback function to be executed when the timeout triggers.
   */
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
