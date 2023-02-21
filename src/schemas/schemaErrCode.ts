export const ErrCode = {
  /** 성공 */
  success: "E0000",
  /**로그인 하지 않음*/
  notLogin: "E0001",
  /** 사용자 없음 */
  notFoundUser: "E0002",
  /** 이메일 없음 */
  notFoundEmail: "E0003",
  /** 비밀번호 틀림 */
  incorrectPwd: "E0004",
  /** 존재하는 이메일 */
  existEmail: "E0005",
  /** 권한없는 사용자 */
  withoutPermission: "E0006",
  /** 데이터를 찾을수 없음 */
  notFoundData: "E0007",
  /** 잘못된 url */
  invalidUrl: "E0008",
  /** 제품아이디 존재하지 않음 */
  notExistProductId: "E0009",
  /** 존재하는 데이터 */
  existData: "E0010",
  /** 모니터링 제품 삭제 에러 */
  failedRemoveProductMonitoring: "E0011",
  /** 잘못된 파리미터 */
  invalidParameter: "E0012",
  /** 제품 모니터링 키워드 데이터 저장 실패 */
  filedAddProductMonitoringKeyword: "E0012",
  /** 알수없는 오류 */
  unknownErr: "E9999",
};
