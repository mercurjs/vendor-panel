import * as z from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name should be a string" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string()
    .min(12, { message: "Password should have at least 12 characters" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one digit" })
    .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string()
})  .refine((data) => data.password === data.confirmPassword, {
  message: "passwords don't match",
  path: ['confirmPassword'],
});