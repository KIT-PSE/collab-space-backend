import { validate } from 'class-validator';
import { CreateRoom, UpdateRoom } from './room.dto';

describe('CreateRoom DTO', () => {
  it('should validate when given a valid name', async () => {
    const dto = new CreateRoom();
    dto.name = 'TestRoom';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should not validate when the name is empty', async () => {
    const dto = new CreateRoom();
    dto.name = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toBeDefined();
    expect(errors[0].constraints['isNotEmpty']).toBe(
      'Name darf nicht leer sein',
    );
  });

  it('should accept an optional password', async () => {
    const dto = new CreateRoom();
    dto.name = 'TestRoom';
    dto.password = 'securepassword';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.password).toBe('securepassword');
  });
});

describe('UpdateRoom DTO', () => {
  it('should validate when given a valid name', async () => {
    const dto = new UpdateRoom();
    dto.name = 'TestUpdateRoom';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
