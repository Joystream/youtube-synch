import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from '../videos/videos.service';
import { ChannelsService } from './channels.service';

describe('ChannelsService', () => {
  let service: ChannelsService;
  let videoService: VideosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelsService, VideosService, ConfigService],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);
    videoService = module.get<VideosService>(VideosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(videoService).toBeDefined()
  });
});
