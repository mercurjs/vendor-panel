import * as z from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name should be a string" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Password should have at least 8 characters" }),
  confirmPassword: z.string()
})  .refine((data) => data.password === data.confirmPassword, {
  message: "passwords don't match",
  path: ['confirmPassword'],
});