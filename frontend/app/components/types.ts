export interface Computer {
    id: number;
    name: string;
    status: string;
    comment?: string;
    department?: string;
    assignedTo?: string;
  }
  
  export interface ComputerInput {
    name: string;
    status: string;
    comment?: string;
    department?: string;
    assignedTo?: string;
  }