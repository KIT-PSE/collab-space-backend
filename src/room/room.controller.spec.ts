import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';

/**
 * Test suite for the RoomController class.
 */
describe('RoomController', () => {
  let controller: RoomController;

  /**
   * Before each test, create a testing module with RoomController as the controller.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
    }).compile();

    controller = module.get<RoomController>(RoomController);
  });

  /**
   * Test if the controller is defined.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
