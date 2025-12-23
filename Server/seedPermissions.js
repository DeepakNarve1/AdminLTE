const mongoose = require("mongoose");
const Permission = require("./src/models/permissionModel");
const Role = require("./src/models/roleModel");
require("dotenv").config();

const permissions = [
  // Dashboard
  {
    name: "view_dashboard",
    displayName: "View Dashboard",
    description: "Can view dashboard",
    category: "dashboard",
  },

  // Users
  {
    name: "view_users",
    displayName: "View Users",
    description: "Can view users list",
    category: "users",
  },
  {
    name: "create_users",
    displayName: "Create Users",
    description: "Can create users",
    category: "users",
  },
  {
    name: "edit_users",
    displayName: "Edit Users",
    description: "Can edit users",
    category: "users",
  },
  {
    name: "delete_users",
    displayName: "Delete Users",
    description: "Can delete users",
    category: "users",
  },

  // Roles
  {
    name: "manage_roles",
    displayName: "Manage Roles",
    description: "Can manage roles and permissions",
    category: "roles",
  },

  // Projects
  {
    name: "view_projects",
    displayName: "View Projects",
    description: "Can view project summary",
    category: "projects",
  },
  {
    name: "create_projects",
    displayName: "Create Projects",
    description: "Can create projects",
    category: "projects",
  },
  {
    name: "edit_projects",
    displayName: "Edit Projects",
    description: "Can edit projects",
    category: "projects",
  },
  {
    name: "delete_projects",
    displayName: "Delete Projects",
    description: "Can delete projects",
    category: "projects",
  },

  // MP Public Problems
  {
    name: "view_mp_public_problems",
    displayName: "View MP Public Problems",
    description: "Can view MP public problems",
    category: "mp_public_problems",
  },
  {
    name: "create_mp_public_problems",
    displayName: "Create MP Public Problems",
    description: "Can create MP public problems",
    category: "mp_public_problems",
  },
  {
    name: "edit_mp_public_problems",
    displayName: "Edit MP Public Problems",
    description: "Can edit MP public problems",
    category: "mp_public_problems",
  },
  {
    name: "delete_mp_public_problems",
    displayName: "Delete MP Public Problems",
    description: "Can delete MP public problems",
    category: "mp_public_problems",
  },

  // Assembly Issue
  {
    name: "view_assembly_issue",
    displayName: "View Assembly Issue",
    description: "Can view assembly issues",
    category: "assembly_issue",
  },

  // Events
  {
    name: "view_events",
    displayName: "View Events",
    description: "Can view events",
    category: "events",
  },

  // Voter
  {
    name: "view_voter",
    displayName: "View Voter",
    description: "Can view voters",
    category: "voter",
  },

  // Samiti
  {
    name: "view_samiti",
    displayName: "View Samiti",
    description: "Can view samiti",
    category: "samiti",
  },

  // District
  {
    name: "view_district",
    displayName: "View District",
    description: "Can view districts",
    category: "district",
  },
];

async function seedPermissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing permissions
    await Permission.deleteMany({});
    console.log("🗑️  Cleared existing permissions");

    // Create permissions
    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // Update superadmin role with all permissions
    const superadminRole = await Role.findOne({ name: "superadmin" });
    if (superadminRole) {
      superadminRole.permissions = createdPermissions.map((p) => p._id);
      superadminRole.sidebarAccess = ["*"];
      await superadminRole.save();
      console.log("✅ Updated superadmin role with all permissions");
    } else {
      // Create superadmin role if it doesn't exist
      await Role.create({
        name: "superadmin",
        displayName: "Super Administrator",
        description: "Full system access with all permissions",
        permissions: createdPermissions.map((p) => p._id),
        sidebarAccess: ["*"],
        isSystem: true,
      });
      console.log("✅ Created superadmin role");
    }

    console.log("\n📋 Permissions created:");
    permissions.forEach((p) => {
      console.log(`  - ${p.name} (${p.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedPermissions();
