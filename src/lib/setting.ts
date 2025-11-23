export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/teacher(.*)": ["teacher"],
  "/parent(.*)": ["parent"],
  "/staff(.*)": ["staff"],
  "/list/teachers": ["admin", "teacher", "staff"],
  "/list/staffs": ["admin", "teacher", "staff"],
  "/list/students": ["admin", "teacher", "staff"],
  "/list/parents": ["admin", "teacher", "staff"],
  "/list/subjects": ["admin", "staff"],
  "/list/lessons": ["admin", "teacher", "student", "parent", "staff"],
  "/list/classes": ["admin", "teacher", "staff"],
  "/list/exams": ["admin", "teacher", "student", "parent", "staff"],
  "/list/assignments": ["admin", "teacher", "student", "parent", "staff"],
  "/list/results": ["admin", "teacher", "student", "parent", "staff"],
  "/list/attendance(.*)": ["admin", "teacher", "student", "parent", "staff"],
  "/list/events": ["admin", "teacher", "student", "parent", "staff"],
  "/list/announcements": ["admin", "teacher", "student", "parent", "staff"],
  "/list/ppdb": ["admin", "staff"],
  "/list/users": ["admin"],
  "/settings": ["admin"],
  "/list/payment(.*)": ["admin", "student", "parent", "staff"],
};
