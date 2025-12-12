const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Permission = require("./models/permissionModel");
const Role = require("./models/roleModel");

dotenv.config();
connectDB();

const seedPermissionsAndRoles = async () => {
  try {
    // Clear existing data
    await Permission.deleteMany({});
    await Role.deleteMany({});

    console.log("🗑️  Cleared existing permissions and roles");

    // Define permissions
    const permissions = [
      // User Management
      {
        name: "view_users",
        displayName: "View Users",
        category: "users",
        description: "Can view user list",
      },
      {
        name: "create_users",
        displayName: "Create Users",
        category: "users",
        description: "Can create new users",
      },
      {
        name: "edit_users",
        displayName: "Edit Users",
        category: "users",
        description: "Can edit user details",
      },
      {
        name: "delete_users",
        displayName: "Delete Users",
        category: "users",
        description: "Can delete users",
      },

      // Reports
      {
        name: "view_reports",
        displayName: "View Reports",
        category: "reports",
        description: "Can view reports",
      },
      {
        name: "create_reports",
        displayName: "Create Reports",
        category: "reports",
        description: "Can create reports",
      },
      {
        name: "export_reports",
        displayName: "Export Reports",
        category: "reports",
        description: "Can export reports",
      },

      // Settings
      {
        name: "view_settings",
        displayName: "View Settings",
        category: "settings",
        description: "Can view settings",
      },
      {
        name: "edit_settings",
        displayName: "Edit Settings",
        category: "settings",
        description: "Can edit settings",
      },

      // Dashboard
      {
        name: "view_dashboard",
        displayName: "View Dashboard",
        category: "dashboard",
        description: "Can view dashboard",
      },

      // Role Management
      {
        name: "manage_roles",
        displayName: "Manage Roles",
        category: "other",
        description: "Can manage roles and permissions",
      },
    ];

    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`✅ Created ${createdPermissions.length} permissions`);

    // Create roles with permissions
    const roles = [
      {
        name: "testing",
        displayName: "Testing",
        description: "Testing role",
        permissions: createdPermissions.map((p) => p._id),
        isSystem: false,
      },
      {
        name: "mp_public_problems",
        displayName: "MP Public Problems",
        description: "MP Public Problems role",
        permissions: createdPermissions
          .filter((p) =>
            [
              "view_users",
              "view_reports",
              "create_reports",
              "export_reports",
              "view_dashboard",
            ].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "bhopal_user1",
        displayName: "BHopal User1",
        description: "Bhopal User 1 role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "bhopal_user2",
        displayName: "Bhopal User 2",
        description: "Bhopal User 2 role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "assembly_stage1",
        displayName: "My Assembly Stage1",
        description: "Assembly Stage 1 role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_reports", "create_reports", "view_dashboard"].includes(
              p.name
            )
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "bhopal_block",
        displayName: "Bhopal Block",
        description: "Bhopal Block role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "tirla_block",
        displayName: "Tirla Block",
        description: "Tirla Block role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "bagh_block",
        displayName: "Bagh Block",
        description: "Bagh Block role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "gandhwani_block",
        displayName: "Gandhwani Block",
        description: "Gandhwani Block role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
      {
        name: "tanda_block",
        displayName: "Tanda Block",
        description: "Tanda Block role",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: false,
      },
    ];

    const createdRoles = await Role.insertMany(roles);
    console.log(`✅ Created ${createdRoles.length} roles`);

    console.log("\n✨ Permissions and Roles seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding permissions and roles:", error.message);
    process.exit(1);
  }
};

seedPermissionsAndRoles();
