import { getDbConnection } from "./db";
import { User } from "@clerk/nextjs/server";

/**
 * Create or get a user in the database
 */
export async function createOrGetUser(clerkUser: User) {
  const sql = await getDbConnection();
  
  try {
    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE clerk_id = ${clerkUser.id}
    `;
    
    if (existingUser && existingUser.length > 0) {
      return existingUser[0];
    }
    
    // Create new user
    const [newUser] = await sql`
      INSERT INTO users (clerk_id, email, full_name)
      VALUES (${clerkUser.id}, ${clerkUser.emailAddresses[0].emailAddress}, ${clerkUser.fullName || null})
      RETURNING *
    `;
    
    return newUser;
  } catch (error) {
    console.error("Error creating/getting user:", error);
    throw error;
  }
}

/**
 * Check if a user exists in the DB by Clerk ID
 */
export async function hasActivePlan(clerkId: string) {
  const sql = await getDbConnection();

  const query = await sql`
    SELECT id FROM users WHERE clerk_id = ${clerkId}
  `;

  return query && query.length > 0;
}

/**
 * No upload limits anymore, always returns false
 */
export async function hasReachedUploadLimit(userId: string) {
  return { hasReachedLimit: false, uploadLimit: Infinity };
}

/**
 * Subscription check wrapper
 */
export async function getSubscriptionStatus(user: User) {
  return await hasActivePlan(user.id);
}
