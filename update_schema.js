const fs = require('fs');
let content = fs.readFileSync('lib/db/schema.ts', 'utf8');

// Replace imports
content = content.replace('import { relations } from "drizzle-orm";', 'import { relations, sql } from "drizzle-orm";');

// Replace defaultNow() with default(sql`timezone('Asia/Kolkata', now())`)
content = content.replace(/\.defaultNow\(\)/g, ".default(sql`timezone('Asia/Kolkata', now())`)");

fs.writeFileSync('lib/db/schema.ts', content);
console.log('Schema updated successfully');
