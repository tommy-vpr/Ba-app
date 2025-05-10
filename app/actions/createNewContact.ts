"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getHubspotCredentials } from "@/lib/getHubspotCredentials";
import { ContactSchema, CreateContactFormValues } from "@/lib/schemas";
import { getHubspotOwners } from "./getHubspotOwners";

export async function createNewContact(
  input: CreateContactFormValues,
  brand: "litto" | "skwezed" = "litto"
) {
  try {
    // ✅ 1. Validate session
    const session = await getServerSession(authOptions);
    const baEmail = session?.user?.email;

    if (!baEmail) {
      return {
        success: false,
        message: "Unauthorized: You must be logged in.",
      };
    }

    // ✅ 2. Get HubSpot owners and preferred owner ID
    const owners = await getHubspotOwners(brand);
    const preferredOwner = owners.find(
      (owner: any) => owner.email?.toLowerCase() === "hemp@itslitto.com"
    );
    const ownerId = preferredOwner?.id || owners?.[0]?.id;

    if (!ownerId) {
      return { success: false, message: "No available HubSpot owners found." };
    }

    // ✅ 3. Validate input using Zod
    const parsed = ContactSchema.safeParse({
      ...input,
      ba_email: baEmail,
      hs_lead_status: "Samples",
      l2_lead_status: "pending visit",
      hubspot_owner_id: ownerId,
    });

    if (!parsed.success) {
      const zodError = parsed.error.format();
      return {
        success: false,
        message: parsed.error.errors[0]?.message || "Invalid form submission",
        errors: zodError,
      };
    }

    // ✅ 4. Prepare API request
    const { baseUrl, token } = getHubspotCredentials(brand);

    const response = await fetch(`${baseUrl}/crm/v3/objects/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties: parsed.data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `HubSpot error: ${response.status} - ${errorText}`,
      };
    }

    const newCreatedContact = await response.json();

    return {
      success: true,
      contactId: newCreatedContact.id,
      contact: {
        id: newCreatedContact.id,
        properties: newCreatedContact.properties,
      },
    };
  } catch (error: any) {
    console.error("createNewContact error:", error);
    return {
      success: false,
      message:
        error?.message || "Unexpected error occurred during contact creation.",
    };
  }
}
