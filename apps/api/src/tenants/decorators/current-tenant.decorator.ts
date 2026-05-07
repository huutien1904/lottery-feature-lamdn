import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { TenantContext } from '../interfaces/tenant-context.interface';

export const CurrentTenant = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const req = ctx.switchToHttp().getRequest<{ tenant?: TenantContext }>();
    return req.tenant;
  },
);
