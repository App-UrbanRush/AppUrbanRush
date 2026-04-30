import { z } from "zod";

export const LoginDTOSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;

export const RegisterDTOSchema = z.object({
  user_email: z.string().email("Email inválido"),
  user_password: z.string().min(6, "Mínimo 6 caracteres"),
  firstName: z.string().min(2, "Nombre requerido"),
  firstLastName: z.string().min(2, "Apellido requerido"),
  cellphone: z.string().min(7, "Teléfono inválido"),
  address: z.string().min(5, "Dirección requerida"),
  gender: z.string().min(1, "Género requerido"),
  rolIds: z.array(z.number()).optional(),
});

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;
