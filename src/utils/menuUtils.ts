/**
 * Menu Utilities
 * Generate menu items from App route configuration
 */

import type { RouteConfig } from "../config/appRoutes";
import type { RoleCode, Permission } from "../constants/roles";

export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  "data-index": number;
  allowedRoles?: RoleCode[];
  requiredPermissions?: Permission[];
}

/**
 * Extract menu items from route configuration
 */
export function getMenuItemsFromRoutes(
  routeConfig: RouteConfig,
  section?: "main" | "student" | "tools"
): MenuItem[] {
  const menuItems: MenuItem[] = [];

  function extractMenuItems(routes: RouteConfig[], basePath: string = "") {
    routes.forEach((route) => {
      // Only include routes that should show in menu
      if (route.showInMenu && route.menuLabel) {
        // Filter by section if specified
        if (!section || route.menuSection === section) {
          const fullPath = route.path.startsWith("/")
            ? route.path
            : `${basePath}/${route.path}`.replace("//", "/");

          menuItems.push({
            key: fullPath,
            icon: route.menuIcon || null,
            label: route.menuLabel,
            "data-index": route.menuIndex ?? 0,
            allowedRoles: route.allowedRoles,
            requiredPermissions: route.requiredPermissions,
          });
        }
      }

      // Recursively process children
      if (route.children) {
        const newBasePath = route.path.startsWith("/")
          ? route.path
          : `${basePath}/${route.path}`.replace("//", "/");
        extractMenuItems(route.children, newBasePath);
      }
    });
  }

  // Start extraction
  if (routeConfig.children) {
    extractMenuItems(routeConfig.children, routeConfig.path);
  }

  // Sort by menuIndex
  return menuItems.sort((a, b) => a["data-index"] - b["data-index"]);
}

/**
 * Get main navigation menu items
 */
export function getMainNavItems(adminRoutes: RouteConfig, studentRoutes: RouteConfig, teacherRoutes: RouteConfig, publicPortalRoutes: RouteConfig): MenuItem[] {
  const adminMainItems = getMenuItemsFromRoutes(adminRoutes, "main");
  const studentMainItems = getMenuItemsFromRoutes(studentRoutes, "main");
  const teacherMainItems = getMenuItemsFromRoutes(teacherRoutes, "main");
  const publicPortalMainItems = getMenuItemsFromRoutes(publicPortalRoutes, "main");
  
  return [...adminMainItems, ...studentMainItems, ...teacherMainItems, ...publicPortalMainItems].sort(
    (a, b) => a["data-index"] - b["data-index"]
  );
}

/**
 * Get tools navigation menu items
 */
export function getToolsNavItems(adminRoutes: RouteConfig): MenuItem[] {
  return getMenuItemsFromRoutes(adminRoutes, "tools");
}

/**
 * Section titles
 */
export const SECTION_TITLES = {
  MAIN: "Quản lý Chính",
  STUDENT: "Cổng sinh viên",
  TOOLS: "Blockchain & Báo cáo",
} as const;

