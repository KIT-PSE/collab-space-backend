import { IsNotEmpty } from 'class-validator';

/**
 * Data transfer object for creating a room.
 */
export class CreateRoom {
  @IsNotEmpty({
    message: 'Name darf nicht leer sein',
  })
  name: string;

  password?: string;
}

/**
 * Data transfer object for updating a room (inherits from CreateRoom).
 */
export class UpdateRoom extends CreateRoom {}
