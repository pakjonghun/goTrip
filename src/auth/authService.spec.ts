import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from './auth.service';
import { PhoneAuthEntity } from './entities/phoneAuth.entity';

const mockPhoneAuthRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

const mockUserRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
});

describe('authservice', () => {
  let authService: AuthService;
  beforeAll(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(PhoneAuthEntity),
          useValue: mockPhoneAuthRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    authService = modules.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it.todo('sign');
  it.todo('verify');
  it.todo('forPasswordPhone');
  it.todo('phone');
  it.todo('phoneConfirm');
  it.todo('tempToken');
  it.todo('sendPhoneAuthNumber');
  it.todo('getSocialUserInfo');
});
