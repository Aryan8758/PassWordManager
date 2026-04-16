import { User, DepartmentRecord } from '../types';

const USERS_KEY = 'deptflow_users';
const RECORDS_KEY = 'deptflow_records';
const SESSION_KEY = 'deptflow_session';

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveUser: (user: User) => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  getRecords: (): DepartmentRecord[] => {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveRecord: (record: DepartmentRecord) => {
    const records = storage.getRecords();
    records.push(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  },
  setSession: (email: string | null) => {
    if (email) {
      localStorage.setItem(SESSION_KEY, email);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },
  getSession: (): string | null => {
    return localStorage.getItem(SESSION_KEY);
  }
};
