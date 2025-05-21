import { pgTable, text, uuid, integer, boolean, timestamp} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
   // Unique identifier for each file/folder
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Basic file/folder information
  name: text("name").notNull(),
  path: text("path").notNull(), // Full path to the file/folder
  size: integer("size").notNull(),
  type: text("type").notNull(), // MIME type for files, "folder" for folders

  // Storage Information
  fileUrl: text("file_url").notNull(), // URL to access the files
  thumbnailUrl: text("thumbnail_url"), // Optional thumbnail for images/documents

   // Ownership and hierarchy
   userId: text("user_id").notNull(), // Owner of the file/folder
   parentId: uuid("parent_id"), //  Parent folder ID (null for root items)
  
   // File/Folder flags
   isFolder: boolean("is_folder").default(false).notNull(), // Whether this is a folder
   isStarred: boolean("is_starred").default(false).notNull(),  // Starred/favorite items
   isTrash: boolean("is_trash").default(false).notNull(), // Items in trash

   // Timestamps
   createdAt: timestamp("created_at").defaultNow().notNull(),
   updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * File Relations
 *
 * This defines the relationships between records in our files table:
 * 1. parent - Each file/folder can have one parent folder
 * 2. children - Each folder can have many child files/folders
 *
 * This creates a hierarchical file structure similar to a real filesystem.
 */
export const filesRelations = relations(files, ({ one, many }) => ({
     // Relationship to parent folder
    parent: one(files, {
        fields: [files.parentId], // The foreign key in this table
        references: [files.id],  // The primary key in the parent table
    }),

    // Relationship to child files/folders
    children: many(files),
}));


/**
 * Type Definitions
 *
 * These types help with TypeScript integration:
 * - File: Type for retrieving file data from the database
 * - NewFile: Type for inserting new file data into the database
 */

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;



