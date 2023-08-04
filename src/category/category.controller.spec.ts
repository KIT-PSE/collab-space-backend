import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';

describe('CategoryController', () => {
  let controller: CategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  /**
   * Test case to ensure that the CategoryController is defined.
   * It checks whether the controller instance is created successfully.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
