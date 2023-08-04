import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';

/**
 * Test suite for the `RoomService` class.
 */
describe('RoomService', () => {
  let service: RoomService;

  /**
   * Initialize the testing module and get an instance of `RoomService`.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomService],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  /**
   * Test case to ensure that the `RoomService` instance is defined.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
