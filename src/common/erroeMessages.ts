export const commonMessages = {
  commonFail: (value) => ({
    ok: false,
    error: `${value}실패했습니다 관리자에게 문의하세요.`,
  }),
  commonNotFuond: (value) => ({
    ok: false,
    error: `${value} 찾을수 없습니다.`,
  }),
  commonExist: (value) => ({
    ok: false,
    error: `이미 사용중인 ${value}입니다.`,
  }),
  commonUnAuth: (value) => ({
    ok: false,
    error: `${value} 권한이 없습니다.`,
  }),
  commonSuccess: {
    ok: true,
  },
  commonWrongData: {
    ok: false,
    error: '올바르지 않는 값입니다.',
  },
  commonLoginFail: {
    ok: false,
    error: '이메일이나 비밀번호가 틀립니다.',
  },
  commonAuthFail: {
    ok: false,
    error: '인증이 실패했습니다.',
  },
};
