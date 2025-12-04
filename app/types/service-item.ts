export type ServiceItem = {
  id: string;
  code: string;
  owner: string;
  systemName: string;
  supportCode: string | null;
  supportName: string | null;
  card: string | null;
  passport: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceItemFormValues = {
  code: string;
  owner: string;
  systemName: string;
  supportCode: string;
  supportName: string;
  card: string;
  passport: string;
  note: string;
};