import { z } from "zod";

export const UserSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  state: z.string().min(1, "Please select a state"),
  secretKey: z.string().min(1, "BA signup key is required"),
});

export type UserSignupValues = z.infer<typeof UserSignupSchema>;

// Admin login schema for validation
export const UserLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type UserLoginValues = z.infer<typeof UserLoginSchema>;

export const ContactSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required"),
  lastname: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Invalid email address"),
  // phone: z.string().trim().optional(),
  jobtitle: z.string().trim().optional(),
  company: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zip: z.string().trim().min(3, "ZIP Code is too short"),
  phone: z
    .string()
    .regex(/^\d{3}-\d{3}-\d{4}$/, "Phone must be in 123-456-7890 format"),

  hs_lead_status: z.enum([
    "NEW",
    "OPEN",
    "IN_PROGRESS",
    "OPEN_DEAL",
    "UNQUALIFIED",
    "ATTEMPTED_TO_CONTACT",
    "CONNECTED",
    "BAD_TIMING",
    "Samples",
  ]),
  l2_lead_status: z.string().default("pending visit"),
  ba_email: z.string().email("Invalid BA email"),
  hubspot_owner_id: z.string(),
});

export type ContactSchemaValues = z.infer<typeof ContactSchema>;

// 2. Create a form-specific schema
export const CreateContactSchema = ContactSchema.omit({
  hs_lead_status: true,
  l2_lead_status: true,
  ba_email: true,
  hubspot_owner_id: true,
});

export type CreateContactFormValues = z.infer<typeof CreateContactSchema>;
