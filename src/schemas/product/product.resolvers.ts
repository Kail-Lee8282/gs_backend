export type ProductCategory = {
  category1?: string;
  categoryCid1?: number;
  category2?: string;
  categoryCid2?: number;
  category3?: string;
  categoryCid3?: number;
  category4?: string;
  categoryCid4?: number;
  fullCategory?: string;
  percent?: number;
  display?: number;
  count?: number;
};

export type ProductChartData = {
  series: string;
  value: number;
};

export type Product = {
  date?: string;
  name: string;
  cid?: number;
  totalSeller?: number;
  productImg?: string;
  loPrice?: number;
  hiPrice?: number;
  avgPrice?: number;
  totalSearch?: number;
  competitionRate?: string;
  brandPercent?: number;
  isAdult?: boolean;
  isLowSearchVolume?: boolean;
  isRestricted?: boolean;
  isSeason?: boolean;
  isSellProhibit?: boolean;
  category?: ProductCategory[];
  trandKwdByAge?: ProductChartData[];
  trandKwdByGender?: ProductChartData[];
  trandKwdByDevice?: ProductChartData[];
  searchVolumeByMonth?: ProductChartData[];
};

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

/**
 * 마지막 카테고리 명칭 반환
 * @param category
 * @returns
 */
export function finalCategory(category?: ProductCategory) {
  if (category) {
    return category.category4 && category.category4.length > 0
      ? category.category4
      : category.category3 && category.category3.length > 0
      ? category.category3
      : category.category2 && category.category2.length > 0
      ? category.category2
      : category.category1;
  } else {
    return "";
  }
}

const resolvers = {
  Query: {
    getProduct: () => {
      return {
        ok: true,
      };
    },
  },
};

export default resolvers;
