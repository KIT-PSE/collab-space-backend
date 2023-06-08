import { IsNotEmpty } from 'class-validator';

export class CreateRoom {
  @IsNotEmpty({
    message: 'Name darf nicht leer sein',
  })
  name: string;

  password?: string;
}

export class UpdateRoom extends CreateRoom {}
