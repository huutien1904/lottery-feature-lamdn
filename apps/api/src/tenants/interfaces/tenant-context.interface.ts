import { TenantRole } from '@prisma/client';

export interface TenantContext {
  tenantId: string;
  role: TenantRole;
}
