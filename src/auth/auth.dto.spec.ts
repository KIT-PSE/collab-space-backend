import { validate } from 'class-validator';
import { RegisterUser } from './auth.dto';
import { CreateUser } from './auth.dto';
import { LoginUser } from './auth.dto';
import { ChangePassword } from './auth.dto';

jest.mock('../common/constraints/unique', () => ({
  IsUnique: (): any => {
    return () => undefined;
  },
}));

describe('RegisterUser DTO', () => {
  let registerUser: RegisterUser;

  beforeEach(() => {
    registerUser = new RegisterUser();
    registerUser.organization = 'Test Organization';
    registerUser.name = 'Test User';
    registerUser.email = 'test@example.com';
    registerUser.password = 'password1234';
    registerUser.confirmPassword = 'password1234';
  });

  it('should validate a correct DTO successfully', async () => {
    const errors = await validate(registerUser);
    expect(errors.length).toBe(0);
  });

  it('should throw an error for missing organization', async () => {
    registerUser.organization = '';
    const errors = await validate(registerUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should throw an error for invalid email format', async () => {
    registerUser.email = 'invalid-email';
    const errors = await validate(registerUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should throw an error for short password', async () => {
    registerUser.password = 'short';
    const errors = await validate(registerUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should throw an error for mismatched password and confirmPassword', async () => {
    registerUser.password = 'password1234';
    registerUser.confirmPassword = 'password5678';
    const errors = await validate(registerUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('Match'); // Assuming that's how you named it in your Match decorator
  });
});

describe('CreateUser DTO', () => {
  let createUser: CreateUser;

  beforeEach(() => {
    createUser = new CreateUser();
  });

  it('should be valid when all fields are correct', async () => {
    createUser.organization = 'Example Organization';
    createUser.name = 'John Doe';
    createUser.email = 'john.doe@example.com';
    createUser.password = 'password1234';

    const errors = await validate(createUser);

    expect(errors).toHaveLength(0);
  });

  it('should not contain the confirmPassword field', () => {
    expect(createUser).not.toHaveProperty('confirmPassword');
  });
});

describe('LoginUser DTO', () => {
  let loginUser: LoginUser;

  beforeEach(() => {
    loginUser = new LoginUser();
  });

  describe('email', () => {
    it('should fail if email is empty', async () => {
      loginUser.email = '';
      loginUser.password = 'samplePassword';
      const errors = await validate(loginUser);
      expect(errors[0].constraints).toHaveProperty(
        'isEmail',
        'E-Mail muss eine gültige E-Mail-Adresse sein',
      );
    });

    it('should fail if email is invalid', async () => {
      loginUser.email = 'invalidEmail';
      loginUser.password = 'samplePassword';
      const errors = await validate(loginUser);
      expect(errors[0].constraints).toHaveProperty(
        'isEmail',
        'E-Mail muss eine gültige E-Mail-Adresse sein',
      );
    });

    it('should pass if email is valid', async () => {
      loginUser.email = 'valid@email.com';
      loginUser.password = 'samplePassword';
      const errors = await validate(loginUser);
      expect(errors).toHaveLength(0);
    });
  });

  describe('password', () => {
    it('should fail if password is empty', async () => {
      loginUser.email = 'valid@email.com';
      loginUser.password = '';
      const errors = await validate(loginUser);
      expect(errors[0].constraints).toHaveProperty(
        'isNotEmpty',
        'Passwort darf nicht leer sein',
      );
    });

    it('should pass if password is provided', async () => {
      loginUser.email = 'valid@email.com';
      loginUser.password = 'samplePassword';
      const errors = await validate(loginUser);
      expect(errors).toHaveLength(0);
    });
  });
});

describe('ChangePassword DTO', () => {
  let changePassword: ChangePassword;

  beforeEach(() => {
    changePassword = new ChangePassword();
    changePassword.currentPassword = 'currentPass1234';
    changePassword.newPassword = 'newPass1234';
    changePassword.confirmNewPassword = 'newPass1234';
  });

  it('should validate a correct DTO successfully', async () => {
    const errors = await validate(changePassword);
    expect(errors.length).toBe(0);
  });

  it('should throw an error for missing current password', async () => {
    changePassword.currentPassword = '';
    const errors = await validate(changePassword);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should throw an error for short new password', async () => {
    changePassword.newPassword = 'short';
    const errors = await validate(changePassword);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should throw an error for mismatched newPassword and confirmNewPassword', async () => {
    changePassword.newPassword = 'newPass1234';
    changePassword.confirmNewPassword = 'otherPass1234';
    const errors = await validate(changePassword);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('Match'); // Assuming that's how you named it in your Match decorator
  });
});
