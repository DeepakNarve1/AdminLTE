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
        name: "superadmin",
        displayName: "Super Administrator",
        description: "Has all permissions",
        permissions: createdPermissions.map((p) => p._id),
        isSystem: true,
      },
      {
        name: "admin",
        displayName: "Administrator",
        description: "Can manage users, reports, and settings",
        permissions: createdPermissions
          .filter((p) =>
            [
              "view_users",
              "create_users",
              "edit_users",
              "delete_users",
              "view_reports",
              "create_reports",
              "export_reports",
              "view_settings",
              "edit_settings",
              "view_dashboard",
            ].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: true,
      },
      {
        name: "manager",
        displayName: "Manager",
        description: "Can view users and create reports",
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
        isSystem: true,
      },
      {
        name: "hr",
        displayName: "HR",
        description: "Can view users and reports",
        permissions: createdPermissions
          .filter((p) =>
            ["view_users", "view_reports", "view_dashboard"].includes(p.name)
          )
          .map((p) => p._id),
        isSystem: true,
      },
      {
        name: "employee",
        displayName: "Employee",
        description: "Can view dashboard",
        permissions: createdPermissions
          .filter((p) => ["view_dashboard"].includes(p.name))
          .map((p) => p._id),
        isSystem: true,
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
