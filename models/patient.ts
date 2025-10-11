export interface Patient {
  _id?: string;
  username?: string; // patients can have usernames if they need an account
  password?: string; // hashed password if they have an account
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  dateOfBirth?: string | null; // ISO date string or date input format
  gender?: 'male' | 'female' | 'other' | null;
  age?: number | null; // calculated from dateOfBirth or manually entered
  civilStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | null;
  phoneNumber?: string | null; // renamed from phone for consistency
  email?: string | null;
  address?: string | null;
  barangay?: string | null;
  municipality?: string | null;
  province?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NewPatient = Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>
