"""
도로공사 영상변환 시스템 테이블 스키마 정의
db-tables.php의 "도로공사 영상변환 시스템 tables" 섹션을 기반으로 작성
"""

from typing import Dict, List, Union, Optional
from dataclasses import dataclass

@dataclass
class TableField:
    """테이블 필드 정의"""
    name: str
    type: str
    comment: str = ""

@dataclass
class TableSchema:
    """테이블 스키마 정의"""
    table_name: str
    key: Union[str, List[str]]  # 단일 키 또는 복합 키
    fields: List[TableField]
    comment: str = ""

# 도로공사 영상변환 시스템 테이블 정의
TABLES: Dict[str, TableSchema] = {
    "MGMT_CONFIG": TableSchema(
        table_name="MGMT_CONFIG",
        key="MGMT_IP",
        comment="구성 정보",
        fields=[
            TableField("MGMT_IP", "varchar(15)", "IP"),
            TableField("MGMT_PORT", "numeric(5)", "PORT"),
            TableField("MGMT_URI", "varchar(100)", "URI"),
            TableField("HB_INTERVAL", "numeric(5)", ""),
            TableField("ISDEBUG", "char(1)", ""),
            TableField("FMS_PORT", "numeric(5)", "미디어 서버 포트"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_MEMBER": TableSchema(
        table_name="MGMT_MEMBER",
        key="WEBID",
        comment="사용자 정보",
        fields=[
            TableField("WEBID", "varchar(15)", "사용자 ID"),
            TableField("PASSWD", "varchar(20)", "암호"),
            TableField("NAME", "varchar(20)", "사용자 이름"),
            TableField("POSITION", "varchar(6)", "직위"),
            TableField("TEL", "varchar(13)", "전화번호"),
            TableField("MOBILE", "varchar(13)", "휴대전화 번호"),
            TableField("EMAIL", "varchar(30)", "email"),
            TableField("REG_DATE", "date", "등록 일자"),
            TableField("LASTCONNDATE", "date", "최종 접속 일자"),
            TableField("OUTDATE", "date", "사용 정지일"),
            TableField("WEBLEVEL", "numeric(1)", "사용 권한"),
        ]
    ),
    "MGMT_CODE": TableSchema(
        table_name="MGMT_CODE",
        key=["GRP_GBN", "GRP_CODE", "CODE"],
        comment="공통 코드",
        fields=[
            TableField("GRP_GBN", "char(1)", "그룹 구분"),
            TableField("GRP_CODE", "varchar(5)", "그룹 코드"),
            TableField("CODE", "varchar(5)", "코드"),
            TableField("CODE_NAME", "varchar(500)", "코드 이름"),
            TableField("SHORT_CODE_NAME", "varchar(100)", "짧은 코드 이름"),
            TableField("REMARKS", "varchar(500)", "주석"),
            TableField("ORD", "numeric(2)", "순서"),
            TableField("USE_YN", "varchar(1)", "사용 여부"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_PLYSKIN": TableSchema(
        table_name="MGMT_PLYSKIN",
        key="SEQ",
        comment="ROADPLUS skin 정보",
        fields=[
            TableField("SEQ", "numeric(5)", "일련 번호"),
            TableField("FILE_PATH", "varchar(200)", "파일 위치"),
            TableField("FILE_NAME", "varchar(100)", "파일 이름"),
            TableField("STAT", "char(1)", "상태"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_MEDIA_INFO": TableSchema(
        table_name="MGMT_MEDIA_INFO",
        key="SEQ",
        comment="ROADPLUS 홍보 동영상",
        fields=[
            TableField("SEQ", "numeric(5)", "일련 번호"),
            TableField("GBN", "char(1)", "구분 번호"),
            TableField("CAMID", "numeric(5)", "카메라 번호"),
            TableField("TITLE", "varchar(200)", "제목"),
            TableField("ROUTE_NAME", "varchar(200)", "노선 번호"),
            TableField("RTMP", "varchar(200)", "RTMP URL"),
            TableField("STREAM", "varchar(200)", "스트림 주소"),
            TableField("KT_CCTV", "varchar(10)", "KT 시작 지점"),
            TableField("STAT", "char(1)", "상태"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_MENU": TableSchema(
        table_name="MGMT_MENU",
        key="NODE_ID",
        comment="메뉴 설정",
        fields=[
            TableField("NODE_ID", "numeric(3)", "노드 ID"),
            TableField("PARENT_NODE_ID", "numeric(3)", "상위 메뉴 노드 ID"),
            TableField("NODE_NAME", "varchar(200)", "노드 이름"),
            TableField("ORD", "numeric(2)", "순서"),
            TableField("URL", "varchar(100)", "URL"),
            TableField("NODE_AUTH", "numeric(1)", "메뉴 권한 등급"),
            TableField("USE_YN", "varchar(1)", "사용 여부"),
            TableField("REG_ID", "varchar(15)", "등록자 ID"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_MENU_MAP": TableSchema(
        table_name="MGMT_MENU_MAP",
        key="NODE_ID",
        comment="메뉴 코드 매핑",
        fields=[
            TableField("NODE_ID", "numeric(3)", "노드 ID"),
            TableField("GRP_GBN", "varchar(5)", "공통코드 GRP_GBN"),
            TableField("GRP_CODE", "varchar(5)", "공통코드 GRP_CODE"),
            TableField("URL", "varchar(100)", "URL 경로"),
            TableField("PARAM_NAME", "varchar(50)", "파라미터"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_FC": TableSchema(
        table_name="MGMT_FC",
        key=["FC_ID", "SERVER_IP"],
        comment="파일변환 서버 정보",
        fields=[
            TableField("FC_ID", "char(10)", "서버 구분자"),
            TableField("FC_NAME", "varchar(30)", "서버 이름"),
            TableField("SERVER_IP", "varchar(17)", "서버 IP 주소"),
            TableField("SERVER_PORT", "numeric(6)", "서버 port 번호"),
            TableField("ALIVE", "char(1)", "동작 여부"),
            TableField("ALIVE_TIME", "date", "마지막 동작 확인 시간"),
            TableField("JSON_JOB", "varchar(10)", "JSON 작업"),
            TableField("JSON_YN", "varchar(1)", "JSOn 처리 여부"),
            TableField("JSON_DATE", "date", "처리 일자"),
            TableField("VERSION", "varchar(32)", "버전"),
            TableField("BUILD_DATE", "date", "S/W build date"),
            TableField("START_DATE", "date", "Serer start date"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_FC_MONITOR_HIS": TableSchema(
        table_name="MGMT_FC_MONITOR_HIS",
        key=["T_DAY", "T_TIME", "T_SSS"],
        comment="파일변환 서버 상태 감시 정보",
        fields=[
            TableField("T_DAY", "char(8)", "날짜"),
            TableField("T_TIME", "char(6)", "시간"),
            TableField("T_SSS", "char(3)", "초"),
            TableField("FC_ID", "char(10)", "서버 구분자"),
            TableField("CPU", "numeric(3)", "CPU 사용률"),
            TableField("MEM", "numeric(3)", "Memory 사용률"),
            TableField("BW_IN", "numeric(6)", "Network 입력 사용률"),
            TableField("BW_OUT", "numeric(6)", "Network 출력 사용률"),
        ]
    ),
    "MGMT_CCTV": TableSchema(
        table_name="MGMT_CCTV",
        key="CCTV_ID",
        comment="카메라 정보",
        fields=[
            TableField("CCTV_ID", "char(12)", "카메라 ID"),
            TableField("CAMERA_NO", "numeric(5)", "카메라 관리 번호"),
            TableField("HQ_CODE", "varchar(5)", "본부 코드"),
            TableField("BRANCH_CODE", "varchar(5)", "지사 코드"),
            TableField("ROUTE_CODE", "varchar(5)", "노선 코드"),
            TableField("LOCATION", "varchar(10)", "설치 위치"),
            TableField("CAMERA_AREA", "varchar(100)", "설치 지역"),
            TableField("ENC_URL", "varchar(100)", "encoder URL"),
            TableField("TRANS_WMS_PORT", "numeric(10)", "변환 서버 WMS 포트"),
            TableField("LINK_ID_S", "varchar(10)", "표준 노드 링크 시작점"),
            TableField("LINK_ID_E", "varchar(10)", "표준 노드 링크 종료점"),
            TableField("ROAD_ID", "varchar(5)", "설치 고속도록 ID"),
            TableField("ROAD_NAME", "varchar(100)", "설치 고속도록 이름"),
            TableField("MILEPOST", "numeric(7,2)", "이정"),
            TableField("BOUND", "varchar(30)", "설치 방향"),
            TableField("LAT", "numeric(12,8)", "경도 좌표"),
            TableField("LNG", "numeric(12,8)", "위도 좌표"),
            TableField("FILEURL_WMV", "varchar(100)", "WMV 파일 저장 경로"),
            TableField("FILEURL_MP4", "varchar(100)", "MP4 파일 저장 경로"),
            TableField("FILEURL_IMG", "varchar(100)", "정지영상 저장 경로"),
            TableField("STAT", "char(1)", "처리 여부"),
            TableField("ALIVE", "char(1)", "ALIVE 여부"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_FMS": TableSchema(
        table_name="MGMT_FMS",
        key="FMS_ID",
        comment="미디어 제공 서버 정보",
        fields=[
            TableField("FMS_ID", "char(11)", "미디어 서버 구분자"),
            TableField("FMS_NAME", "varchar(30)", "미디어 서버 이름"),
            TableField("FMS_IP", "varchar(17)", "미디어 서버 IP 주소"),
            TableField("FMS_EXT_IP", "varchar(50)", "미디어 서버 외부 IP"),
            TableField("FMS_CON_ID", "varchar(15)", "미디어 서버 접속 ID"),
            TableField("FMS_PASSWD", "varchar(15)", "미디어 서버 접속 password"),
            TableField("FMS_PORT", "numeric(6)", "미디어 서버 포트"),
            TableField("SVR_TYPE", "varchar(5)", "미디어 서버 종류"),
            TableField("ALIVE", "char(1)", "동작 여부"),
            TableField("ALIVE_TIME", "date", "마지막 동작 확인 시간"),
            TableField("JSON_JOB", "varchar(10)", "JSON 작업"),
            TableField("JSON_YN", "varchar(1)", "JSOn 처리 여부"),
            TableField("JSON_DATE", "date", "처리 일자"),
            TableField("START_DATE", "date", "Serer start date"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_FMS_MONITOR_HIS": TableSchema(
        table_name="MGMT_FMS_MONITOR_HIS",
        key=["T_DAY", "T_TIME", "T_SSS"],
        comment="미디어 서버 상태 감시 기록",
        fields=[
            TableField("T_DAY", "char(8)", "날짜"),
            TableField("T_TIME", "char(6)", "시간"),
            TableField("T_SSS", "char(3)", "초"),
            TableField("GBN", "char(1)", "구분"),
            TableField("FMS_CH_ID", "char(11)", "채널 구분자"),
            TableField("CPU", "numeric(3)", "CPU 사용률"),
            TableField("MEM", "numeric(3)", "Memory 사용률"),
            TableField("BW_IN", "numeric(6)", "Network 입력 사용률"),
            TableField("BW_OUT", "numeric(6)", "Network 출력 사용률"),
            TableField("CUMUL_CNT", "numeric(9)", "누적 접속자 수"),
            TableField("NOW_CNT", "numeric(9)", "현재 접속자 수"),
        ]
    ),
    "MGMT_FC_CHANNEL": TableSchema(
        table_name="MGMT_FC_CHANNEL",
        key="CH_ID",
        comment="파일 제공 채널 정보",
        fields=[
            TableField("CH_ID", "char(10)", "채널 구분자"),
            TableField("FC_ID", "char(10)", "해당 파일 변환 서버 구분자"),
            TableField("ENC_URL", "varchar(100)", "encoder URL"),
            TableField("FMS_URL", "varchar(100)", "미디어 서버 URL"),
            TableField("CH_VENC", "varchar(5)", "인코더 형식"),
            TableField("CH_VSIZE", "varchar(5)", "크기"),
            TableField("CH_VFPS", "varchar(10)", "frame rate"),
            TableField("CH_VKPBS", "varchar(10)", "bit rate"),
            TableField("CH_SAVE_YN", "char(1)", "정지영상 저장 여부"),
            TableField("CH_STYPE", "varchar(5)", "저장 영상 형식"),
            TableField("CH_SKPBS", "varchar(10)", "저장 영상 bit rate"),
            TableField("CH_SFPS", "varchar(5)", "저장 영상 frame rate"),
            TableField("CH_SSIZE", "varchar(5)", "저장 영상 크기"),
            TableField("CH_ALIVE", "char(1)", "동작 여부"),
            TableField("CH_ALIVE_TIME", "date", "마지막 동작 확인 시간"),
            TableField("JSON_JOB", "varchar(10)", "JSON 작업"),
            TableField("JSON_YN", "varchar(1)", "JSOn 처리 여부"),
            TableField("JSON_DATE", "date", "처리 일자"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_CHANNEL": TableSchema(
        table_name="MGMT_CHANNEL",
        key="CH_ID",
        comment="변환 서버 채널 정보",
        fields=[
            TableField("CH_ID", "char(10)", "채널 구분자"),
            TableField("CCTV_ID", "char(12)", "CCTV ID"),
            TableField("TRANS_ID", "char(10)", "영상 변환 서버 구분자"),
            TableField("FMS_ID", "char(11)", "연결 미디어 제공 서버 구분자"),
            TableField("KT_CCTV", "varchar(10)", "KT 개시지점 이름"),
            TableField("CH_VENC", "varchar(5)", "인코더 형식"),
            TableField("CH_VSIZE", "varchar(5)", "크기"),
            TableField("CH_VFPS", "varchar(10)", "frame rate"),
            TableField("CH_VKPBS", "varchar(10)", "bit rate"),
            TableField("CH_ALIVE", "char(1)", "동작 여부"),
            TableField("CH_ALIVE_TIME", "date", "마지막 동작 확인 시간"),
            TableField("CH_WMV_VENC", "varchar(5)", "WMV 형식"),
            TableField("CH_WMV_VSIZE", "varchar(5)", "WMV 크기"),
            TableField("CH_WMV_VFPS", "varchar(10)", "WMV frame rate"),
            TableField("CH_WMV_VKPBS", "varchar(10)", "WMV bit rate"),
            TableField("CH_WMV_YN", "char(1)", "WMV 저장 여부"),
            TableField("JSON_JOB", "varchar(10)", "JSON 작업"),
            TableField("JSON_YN", "varchar(1)", "JSOn 처리 여부"),
            TableField("JSON_DATE", "date", "처리 일자"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_TRANS": TableSchema(
        table_name="MGMT_TRANS",
        key=["TRANS_ID", "TRANS_IP"],
        comment="영상 변환 서버 정보",
        fields=[
            TableField("TRANS_ID", "char(10)", "변환 서버 구분자"),
            TableField("TRANS_NAME", "varchar(30)", "변환 서버 이름"),
            TableField("TRANS_IP", "varchar(17)", "변환 서버 IP 주소"),
            TableField("TRANS_PORT", "numeric(6)", "변환 서버 포트"),
            TableField("ALIVE", "char(1)", "동작 여부"),
            TableField("ALIVE_TIME", "date", "마지막 동작 확인 시간"),
            TableField("JSON_JOB", "varchar(10)", "JSON 작업"),
            TableField("JSON_YN", "varchar(1)", "JSOn 처리 여부"),
            TableField("JSON_DATE", "date", "처리 일자"),
            TableField("VERSION", "varchar(32)", "버전"),
            TableField("BUILD_DATE", "date", "S/W build date"),
            TableField("START_DATE", "date", "Serer start date"),
            TableField("REG_DATE", "date", "등록 일자"),
        ]
    ),
    "MGMT_TRANS_MONITOR_HIS": TableSchema(
        table_name="MGMT_TRANS_MONITOR_HIS",
        key=["T_DAY", "T_TIME", "T_SSS"],
        comment="영상 변환서버 상태 기록",
        fields=[
            TableField("T_DAY", "char(8)", "날짜"),
            TableField("T_TIME", "char(6)", "시간"),
            TableField("T_SSS", "char(3)", "초"),
            TableField("TRANS_ID", "char(10)", "채널 구분자"),
            TableField("CPU", "numeric(3)", "CPU 사용률"),
            TableField("MEM", "numeric(3)", "Memory 사용률"),
            TableField("BW_IN", "numeric(6)", "Network 입력 사용률"),
            TableField("BW_OUT", "numeric(6)", "Network 출력 사용률"),
        ]
    ),
    "MGMT_FMS_TRAFFIC_MONTH": TableSchema(
        table_name="MGMT_FMS_TRAFFIC_MONTH",
        key=["YYYY", "MM", "SVC", "VOL"],
        comment="미디어 서버 월간 통신량 기록",
        fields=[
            TableField("YYYY", "char(4)", "년도"),
            TableField("MM", "char(2)", "월"),
            TableField("SVC", "char(11)", "서비스명"),
            TableField("VOL", "char(11)", "개시 지점"),
            TableField("T_BYTE", "numeric(11)", "전송량"),
            TableField("MAX_TRAF", "numeric(11)", "최대 전송량"),
            TableField("MIN_TRAF", "numeric(11)", "최소 전송량"),
        ]
    ),
    "MGMT_FMS_HIT_MONTH": TableSchema(
        table_name="MGMT_FMS_HIT_MONTH",
        key=["YYYY", "MM", "SVC", "VOL"],
        comment="미디어 서버 월간 접속자 기록",
        fields=[
            TableField("YYYY", "char(4)", "년도"),
            TableField("MM", "char(2)", "월"),
            TableField("SVC", "char(11)", "서비스명"),
            TableField("VOL", "char(11)", "개시 지점"),
            TableField("HIT", "numeric(11)", "접속자 수"),
            TableField("CONN", "numeric(11)", "누적 접속자 수"),
        ]
    ),
    "MGMT_FMS_HIT": TableSchema(
        table_name="MGMT_FMS_HIT",
        key=["YYYY", "MM", "DD", "HH", "SVC", "VOL"],
        comment="미디어 서버 접속자 기록",
        fields=[
            TableField("YYYY", "char(4)", "년도"),
            TableField("MM", "char(2)", "월"),
            TableField("DD", "char(2)", "일"),
            TableField("HH", "char(2)", "초"),
            TableField("SVC", "char(11)", "서비스명"),
            TableField("VOL", "char(11)", "개시 지점"),
            TableField("HIT", "numeric(11)", "접속자 수"),
            TableField("CONN", "numeric(11)", "누적 접속자 수"),
        ]
    ),
    "MGMT_FMS_TRAFFIC": TableSchema(
        table_name="MGMT_FMS_TRAFFIC",
        key=["YYYY", "MM", "DD", "HH", "SVC", "VOL"],
        comment="미디어 서버 통신량 기록",
        fields=[
            TableField("YYYY", "char(4)", "년도"),
            TableField("MM", "char(2)", "월"),
            TableField("DD", "char(2)", "일"),
            TableField("HH", "char(2)", "초"),
            TableField("SVC", "char(11)", "서비스명"),
            TableField("VOL", "char(11)", "개시 지점"),
            TableField("T_BYTE", "numeric(11)", "전송량"),
            TableField("MAX_TRAF", "numeric(11)", "최대 전송량"),
            TableField("MIN_TRAF", "numeric(11)", "최소 전송량"),
        ]
    ),
    "MGMT_OUTCONTROL": TableSchema(
        table_name="MGMT_OUTCONTROL",
        key=["CCTV_ID", "OP_TIME", "SERVER_TIME"],
        comment="video exhibtion list",
        fields=[
            TableField("OP_ID", "varchar(20)", "key"),
            TableField("CLIENT_IP", "varchar(16)", "product name"),
            TableField("CCTV_ID", "varchar(12)", "version"),
            TableField("OP_TIME", "date", "release date"),
            TableField("SERVER_TIME", "date", "release date"),
            TableField("OP_COMMENT", "varchar(30)", "release date"),
            TableField("USE_YN", "varchar(10)", "release date"),
            TableField("CUT_STATUS", "varchar(1)", "release date"),
        ]
    ),
    "MGMT_VERSION": TableSchema(
        table_name="MGMT_VERSION",
        key="KEY",
        comment="application version",
        fields=[
            TableField("KEY", "varchar(32)", "key"),
            TableField("PRODUCT", "varchar(64)", "product name"),
            TableField("VERSION", "varchar(32)", "version"),
            TableField("RELEASE_DATE", "date", "release date"),
            TableField("PATH", "varchar(256)", "executable path including executable name"),
        ]
    ),
}

def get_table_key(table_name: str) -> Union[str, List[str]]:
    """테이블의 키 필드 반환 (tables.py에 정의된 경우)"""
    if table_name not in TABLES:
        raise ValueError(f"Table {table_name} not found in TABLES")
    return TABLES[table_name].key

def get_table_schema(table_name: str) -> Optional[TableSchema]:
    """테이블 스키마 반환"""
    return TABLES.get(table_name)

def is_table_exists(table_name: str) -> bool:
    """테이블 존재 여부 확인 (tables.py에 정의된 경우만)"""
    return table_name in TABLES

def get_all_table_names() -> List[str]:
    """모든 테이블 이름 반환 (tables.py에 정의된 테이블만)"""
    return list(TABLES.keys())
