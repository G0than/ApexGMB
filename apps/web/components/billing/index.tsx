import type { roleHasPermission } from "@apexgmb/core";

export const ReadOnlyBanner = (_props: { role: Parameters<typeof roleHasPermission>[0] }): null => null;
