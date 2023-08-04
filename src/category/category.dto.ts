import { IsNotEmpty } from 'class-validator';

/**
 * Data transfer object (DTO) for creating a new category.
 */
export class CreateCategory {
  /**
   * The name of the category to be created.
   */
  @IsNotEmpty({
    message: 'Name darf nicht leer sein',
  })
  name: string;
}

/**
 * Data transfer object (DTO) for updating an existing category.
 * Inherits properties from the CreateCategory DTO.
 */
export class UpdateCategory extends CreateCategory {}
