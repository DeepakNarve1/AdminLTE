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
    name: "view_roles",
    displayName: "View Roles",
    description: "Can view roles list",
    category: "roles",
  },
  {
    name: "create_roles",
    displayName: "Create Roles",
    description: "Can create roles",
    category: "roles",
  },
  {
    name: "edit_roles",
    displayName: "Edit Roles",
    description: "Can edit roles",
    category: "roles",
  },
  {
    name: "delete_roles",
    displayName: "Delete Roles",
    description: "Can delete roles",
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

  {
    name: "view_assembly_issues",
    displayName: "View Assembly Issues",
    description: "Can view assembly issues",
    category: "assembly_issue",
  },
  {
    name: "create_assembly_issues",
    displayName: "Create Assembly Issues",
    description: "Can create assembly issues",
    category: "assembly_issue",
  },
  {
    name: "edit_assembly_issues",
    displayName: "Edit Assembly Issues",
    description: "Can edit assembly issues",
    category: "assembly_issue",
  },
  {
    name: "delete_assembly_issues",
    displayName: "Delete Assembly Issues",
    description: "Can delete assembly issues",
    category: "assembly_issue",
  },

  // Events
  {
    name: "view_events",
    displayName: "View Events",
    description: "Can view events",
    category: "events",
  },
  {
    name: "create_events",
    displayName: "Create Events",
    description: "Can create events",
    category: "events",
  },
  {
    name: "edit_events",
    displayName: "Edit Events",
    description: "Can edit events",
    category: "events",
  },
  {
    name: "delete_events",
    displayName: "Delete Events",
    description: "Can delete events",
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
    name: "view_districts",
    displayName: "View Districts",
    description: "Can view districts list",
    category: "districts",
  },
  {
    name: "create_districts",
    displayName: "Create Districts",
    description: "Can create districts",
    category: "districts",
  },
  {
    name: "edit_districts",
    displayName: "Edit Districts",
    description: "Can edit districts",
    category: "districts",
  },
  {
    name: "delete_districts",
    displayName: "Delete Districts",
    description: "Can delete districts",
    category: "districts",
  },

  // Division
  {
    name: "view_divisions",
    displayName: "View Divisions",
    description: "Can view divisions list",
    category: "divisions",
  },
  {
    name: "create_divisions",
    displayName: "Create Divisions",
    description: "Can create divisions",
    category: "divisions",
  },
  {
    name: "edit_divisions",
    displayName: "Edit Divisions",
    description: "Can edit divisions",
    category: "divisions",
  },
  {
    name: "delete_divisions",
    displayName: "Delete Divisions",
    description: "Can delete divisions",
    category: "divisions",
  },

  // State
  {
    name: "view_states",
    displayName: "View States",
    description: "Can view states list",
    category: "states",
  },
  {
    name: "create_states",
    displayName: "Create States",
    description: "Can create states",
    category: "states",
  },
  {
    name: "edit_states",
    displayName: "Edit States",
    description: "Can edit states",
    category: "states",
  },
  {
    name: "delete_states",
    displayName: "Delete States",
    description: "Can delete states",
    category: "states",
  },

  // Member
  {
    name: "view_members",
    displayName: "View Members",
    description: "Can view members list",
    category: "members",
  },
  {
    name: "create_members",
    displayName: "Create Members",
    description: "Can create members",
    category: "members",
  },
  {
    name: "edit_members",
    displayName: "Edit Members",
    description: "Can edit members",
    category: "members",
  },
  {
    name: "delete_members",
    displayName: "Delete Members",
    description: "Can delete members",
    category: "members",
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
