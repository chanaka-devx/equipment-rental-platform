import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const action = `${req.method} ${req.route?.path}`;

    return next.handle().pipe(
      tap(async () => {
        if (req.user) {
          await this.prisma.activityLog.create({
            data: { userId: req.user.userId, action, details: { body: req.body, params: req.params } },
          });
        }
      }),
    );
  }
}