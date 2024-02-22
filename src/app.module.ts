import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { EmployeeModule } from './employee/employee.module';
import { LeaveModule } from './leave/leave.module';
import { AttendanceModule } from './attendance/attendance.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { AdministratorModule } from './administrator/administrator.module';

@Module({
  imports: [PrismaModule, UserModule, EmployeeModule, LeaveModule, AttendanceModule, RoleModule, AuthModule,  AdministratorModule],
})
export class AppModule {}
