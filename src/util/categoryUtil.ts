/**
 * 전체 카테고리 경로 변경
 * @param category1
 * @param category2
 * @param category3
 * @param category4
 * @returns
 */
export const fullPathCategory = (
  category1: string,
  category2: string,
  category3: string,
  category4: string
) => {
  let result = "";
  if (category1) {
    result += category1;
    if (category2) {
      result += `>${category2}`;
      if (category3) {
        result += `>${category3}`;
        if (category4) {
          result += `>${category4}`;
        }
      }
    }
  }

  return result;
};
