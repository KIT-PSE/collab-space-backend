import { OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../user/user.entity';
import { IsUnique } from '../common/constraints/unique';
import { Match } from '../common/constraints/match';

export class RegisterUser {
  @IsNotEmpty({
    message: 'Schule / Universität oder Organisation darf nicht leer sein',
  })
  organization: string;

  @IsNotEmpty({
    message: 'Name darf nicht leer sein',
  })
  name: string;

  @IsEmail(
    {},
    {
      message: 'E-Mail muss eine gültige E-Mail-Adresse sein',
    },
  )
  @IsUnique(User, {
    message: 'Diese E-Mail-Adresse ist bereits vergeben',
  })
  email: string;

  @IsNotEmpty({
    message: 'Passwort darf nicht leer sein',
  })
  @MinLength(8, {
    message: 'Passwort muss mindestens 8 Zeichen lang sein',
  })
  password: string;

  @IsNotEmpty({
    message: 'Passwort darf nicht leer sein',
  })
  @Match('password', {
    message: 'Passwörter müssen übereinstimmen',
  })
  confirmPassword: string;
}

export class CreateUser extends OmitType(RegisterUser, ['confirmPassword']) {}

export class LoginUser {
  @IsEmail(
    {},
    {
      message: 'E-Mail muss eine gültige E-Mail-Adresse sein',
    },
  )
  email: string;

  @IsNotEmpty({
    message: 'Passwort darf nicht leer sein',
  })
  password: string;
}

export interface AuthPayload {
  token: string;
  user: User;
  exp: number;
}
