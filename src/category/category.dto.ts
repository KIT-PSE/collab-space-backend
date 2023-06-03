import { IsNotEmpty } from 'class-validator';

export class CreateCategory {
  @IsNotEmpty({
    message: 'Name darf nicht leer sein',
  })
  name: string;
}

export class UpdateCategory extends CreateCategory {}
