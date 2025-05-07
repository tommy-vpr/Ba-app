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

// export const contactSchema = z.object({
//   firstname: z.string().min(1, "First name is required"),
//   lastname: z.string().min(1, "Last name is required"),
//   jobtitle: z.string().min(1, "Job title is required"),
//   email: z.string().email("Invalid email"),
//   company: z.string().min(1, "Company is required"),
//   phone: z.string().min(1, "Phone is required"),
//   address: z.string().min(1, "Address is required"),
//   city: z.string().min(1, "City is required"),
//   state: z.string().min(1, "State is required"),
//   zip: z.string().min(1, "ZIP is required"),

//   // These will be added server-side too
//   hs_lead_status: z.literal("samples").optional(),
//   l2_lead_status: z.literal("pending visit").optional(),
//   ba_email: z.string().email().optional(),
// });

// export type ContactSchema = z.infer<typeof contactSchema>;

export const ContactSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  jobtitle: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().min(3, "ZIP Code is too short"),

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
