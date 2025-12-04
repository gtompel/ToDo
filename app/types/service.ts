export type Service = {
  id: string;
  name: string;
  description: string | null;
  responsibleId: string;
  responsible: {
    id: string;
    name: string; // Фамилия Имя
    email: string;
    position: string | null;
  };
  backupStaff: {
    id: string;
    name: string;
    email: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type ServiceFormValues = {
  name: string;
  description: string;
  responsibleId: string;
  backupStaffIds: string[];
};