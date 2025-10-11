export interface User {
  _id?: string;
  username: string;
  password: string;
  role: 'field_collector' | 'lab_tech' | 'admin' | 'ext_expert' | 'patient';
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  email?: string | null;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUser = Omit<User, '_id' | 'createdAt' | 'updatedAt'>
