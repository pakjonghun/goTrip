import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { PhoneAuthEntity } from 'src/auth/entities/phoneAuth.entity';
import { commonMessages } from 'src/common/erroeMessages';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  checkPassword: jest.fn(),
});

const mockAuthService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  forPasswordPhone: jest.fn(),
  phone: jest.fn(),
  phoneConfirm: jest.fn(),
  tempToken: jest.fn(),
  sendPhoneAuthNumber: jest.fn(),
});

type MockRepo<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('userservice', () => {
  let userService: UserService;
  let userRepo: MockRepo<User>;
  let phoneAuthRepo: MockRepo<PhoneAuthEntity>;
  let authService: AuthService;

  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo(),
        },
        {
          provide: AuthService,
          useValue: mockAuthService(),
        },
        {
          provide: getRepositoryToken(PhoneAuthEntity),
          useValue: mockRepo(),
        },
      ],
    }).compile();
    userService = modules.get<UserService>(UserService);
    userRepo = modules.get(getRepositoryToken(User));
    phoneAuthRepo = modules.get(getRepositoryToken(PhoneAuthEntity));
    authService = modules.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('hangleChanger', () => {
    const result = userService.hangleChanger('email');
    expect(result).toBe('이메일');
    const result1 = userService.hangleChanger('phoneNumber');
    expect(result1).toBe('연락처');
    const result2 = userService.hangleChanger('errorval');
    expect(result2).toBe(undefined);
  });

  it('onlyExistCheck', async () => {
    userRepo.findOne.mockResolvedValue({ id: 1 });
    const result = await userService.onlyExistCheck({ id: 1 });
    expect(result).toStrictEqual([null, null]);

    userRepo.findOne.mockResolvedValue({ id: 1 });

    const result1 = await userService.onlyExistCheck({ email: 1 });
    expect(result1).toStrictEqual(['email', { id: 1 }]);

    const result2 = await userService.onlyExistCheck({ phoneNumber: 1 });
    expect(result2).toStrictEqual(['phoneNumber', { id: 1 }]);
  });

  describe('join', () => {
    const diffPassUser = {
      pwd: '1',
      pwdConfirm: '2',
      email: '1',
      nickName: '1',
      phoneNumber: '1',
    };
    it('wrong password', async () => {
      const result = await userService.join(diffPassUser);
      expect(result).toStrictEqual(commonMessages.commonWrongConfirmPassword);
    });

    const user = {
      pwd: '1',
      pwdConfirm: '1',
      email: '1',
      nickName: '1',
      phoneNumber: '1',
    };
    it('phone or email exist then fail', async () => {
      userRepo.findOne.mockRejectedValue({ id: 1 });

      userRepo.findOne.mockResolvedValue({ id: 1 });
      const result1 = await userService.join(user);

      expect(userRepo.findOne).toBeCalled();
      expect(result1).toStrictEqual(
        commonMessages.commonExist(userService.hangleChanger('email')),
      );
    });

    it('should return success', async () => {
      userRepo.findOne.mockResolvedValue(undefined);

      userRepo.create.mockReturnValue(user);

      const result = await userService.join(user);
      expect(userRepo.save).toBeCalledWith(user);
      expect(result).toStrictEqual(commonMessages.commonSuccess);
    });

    it('should return error', async () => {
      userRepo.findOne.mockRejectedValue({ error: '?' });
      const result = await userService.join(user);
      expect(result).toEqual(commonMessages.commonFail('회원가입을'));
    });
  });

  it('findByConditionAndConfirmExist', async () => {
    userRepo.findOne.mockResolvedValue(undefined);
    const result = await userService.findByConditionAndConfirmExist(
      { id: 1 },
      { id: 1 },
    );
    expect(result).toStrictEqual([null, null]);

    userRepo.findOne.mockResolvedValue({ id: 1 });

    const result1 = await userService.findByConditionAndConfirmExist(
      { email: 1 },
      { email: 1 },
    );
    expect(result1).toStrictEqual(['email', { id: 1 }]);

    const result2 = await userService.findByConditionAndConfirmExist(
      { phoneNumber: 1 },
      { phoneNumber: 1 },
    );
    expect(result2).toStrictEqual(['phoneNumber', { id: 1 }]);
  });
  describe('login', () => {
    const loginAccount = { email: '1', pwd: '1', checkPassword: jest.fn() };

    it('should return exist error', async () => {
      userRepo.findOne.mockResolvedValue(undefined);
      const loginResult = await userService.login(loginAccount);
      expect(userRepo.findOne).toBeCalledTimes(1);
      expect(userRepo.findOne).toBeCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(loginResult).toStrictEqual(commonMessages.commonLoginFail);
    });

    it('should return password error', async () => {
      userRepo.findOne.mockResolvedValue(loginAccount);
      loginAccount.checkPassword.mockResolvedValue(false);
      const loginResult = await userService.login({ email: '1', pwd: '2' });

      expect(loginResult).toStrictEqual(commonMessages.commonLoginFail);
    });

    it('should return success', async () => {
      userRepo.findOne.mockResolvedValue(loginAccount);
      loginAccount.checkPassword.mockResolvedValue(true);
      authService.verify
    });
  });

  it.todo('socialLoginService');
  it.todo('changePassword');
  it.todo('updateUser');
  it.todo('refrechToken');
  it.todo('confirmExist');
});
