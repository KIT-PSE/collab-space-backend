import { OmitType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { User } from '../user/user.entity';
import { IsUnique } from '../common/constraints/unique';
import { Match } from '../common/constraints/match';

/**
 * Data structure for registering a new user.
 */
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
    message: 'Passwörter müssen übereinstimmen',
  })
  @Match('password', {
    message: 'Passwörter müssen übereinstimmen',
  })
  confirmPassword: string;
}

/**
 * Data structure for creating a new user, based on the RegisterUser class but without confirmPassword field.
 */
export class CreateUser extends OmitType(RegisterUser, ['confirmPassword']) {}

/**
 * Data structure for user login.
 */
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

/**
 * Data structure for changing user password.
 */
export class ChangePassword {
  @IsNotEmpty({
    message: 'Bitte gib dein aktuelles Passwort ein',
  })
  currentPassword: string;

  @IsNotEmpty({
    message: 'Das neue Passwort darf nicht leer sein',
  })
  @MinLength(8, {
    message: 'Passwort muss mindestens 8 Zeichen lang sein',
  })
  newPassword: string;

  @IsNotEmpty({
    message: 'Passwörter müssen übereinstimmen',
  })
  @Match('newPassword', {
    message: 'Passwörter müssen übereinstimmen',
  })
  confirmNewPassword: string;
}

/**
 * Payload structure returned after successful authentication.
 */
export interface AuthPayload {
  token: string;
  user: User;
  exp: number;
}
