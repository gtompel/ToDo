export type UserActivity = {
  lastLogin?: string | Date | null;
  lastActivity?: string | Date | null;
  passwordLastChanged?: string | Date | null;
};

export type UserFormData = {
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  position?: string;
  department?: string;
  password?: string;
  role?: 'USER' | 'TECHNICIAN' | 'MANAGER' | 'ADMIN';
};

export type UserFormResult = {
  success: boolean;
  error?: string;
};

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string | null;
  };


export type SearchResult = {
  type: string;
  id: string;
  href: string;
  title: string;
  description: string;
};
  
  export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  export type Status =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'IMPLEMENTED'
    | 'CANCELLED'
    | 'DRAFT'
    | string;

  // В API даты должны приходить как ISO-строки
  export type Change = {
    id: string;
    title: string;
    description?: string | null;
    status: Status;
    priority?: Priority;
    category?: string | null;
    createdAt: string; // ISO date string
    scheduledAt?: string | null; // ISO date string or null
    createdBy?: User | null;
    assignedTo?: User | null;
    assignedToId?: string | null;
  };

export type UserLite = { id: string; firstName: string; lastName: string; email: string }

export type IncidentWithUsers = {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  attachments: string[];
  expectedResult: string | null;
  preActions: string | null;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
};

export type RequestWithUsers = {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  acknowledgmentFile: string | null;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
};