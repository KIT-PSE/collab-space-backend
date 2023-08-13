import { validate } from 'class-validator';
import { CreateCategory, UpdateCategory } from './category.dto';

describe('CreateCategory DTO', () => {
  it('should validate a valid name', async () => {
    const dto = new CreateCategory();
    dto.name = 'TestCategory';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should not validate an empty name', async () => {
    const dto = new CreateCategory();
    dto.name = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toBeDefined();
    expect(errors[0].constraints['isNotEmpty']).toBe(
      'Name darf nicht leer sein',
    );
  });
});

describe('UpdateCategory DTO', () => {
  it('should validate a valid name', async () => {
    const dto = new UpdateCategory();
    dto.name = 'TestUpdateCategory';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
