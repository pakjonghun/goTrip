//각 지역으로부터 200km 이내의 지역코드들 모음
export const NEAR_AREA = {
  1: [2, 31, 32, 34, 33, 3, 8],
  2: [1, 31, 32, 34, 33, 3, 8],
  31: [1, 2, 32, 34, 33, 3, 37, 8],
  32: [1, 2, 31],
  34: [1, 2, 31, 33, 3, 37, 8],
  33: [1, 2, 31, 34, 3, 37, 35, 4, 8],
  3: [1, 2, 31, 34, 33, 37, 35, 4, 8],
  37: [31, 34, 33, 3, 5, 38, 4, 8],
  5: [37, 38, 8],
  38: [37, 5],
  35: [33, 3, 4, 7, 8],
  4: [33, 3, 37, 35, 36, 7, 6, 8],
  36: [4, 7, 6],
  7: [35, 4, 36, 6],
  6: [4, 36, 7],
  8: [1, 2, 31, 34, 33, 3, 37, 5, 35, 4],
  39: [39],
};

export const CATEGORIES = ['C0112', 'C0113', 'C0114', 'C0115', 'C0117'];

export const AREA_CODES = [
  1, 2, 3, 4, 5, 6, 7, 8, 31, 32, 33, 34, 35, 36, 37, 38, 39,
];
