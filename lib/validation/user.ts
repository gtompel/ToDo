import { z } from "zod";

export const userPatchSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  password: z.string().min(6).optional(),
  status: z.string().optional(),
  isActive: z.boolean().optional(),
}); 