export type Grade = {
  code?: string;
  gradeName?: string;
  gradeDesc?: string;
  level?: number;
};

export type User = {
  id?: string;
  email?: string;
  userName?: string;
  password?: string;
  phoneNum?: string;
  grade?: Grade;
  createdAt?: string;
  update?: string;
};
