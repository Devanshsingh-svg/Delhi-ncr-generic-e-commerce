import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserRecord } from '@gq/domain';

export const CurrentUser = createParamDecorator(
  (data: keyof UserRecord | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);