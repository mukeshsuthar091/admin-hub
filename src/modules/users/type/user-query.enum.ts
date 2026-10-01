export enum UserRoleFilter {
  ALL = 'ALL',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatusFilter {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum UserSortBy {
  DATE_JOINED = 'createdAt',
  NAME = 'name',
}

export enum UserSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}
