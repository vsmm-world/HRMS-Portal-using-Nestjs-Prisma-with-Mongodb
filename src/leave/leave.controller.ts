import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { ApprovalDto, CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Leaves')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto, @Request() req) {
    return this.leaveService.create(createLeaveDto, req);
  }
  @Post('approve')
  approve(@Body() approvalDto: ApprovalDto, @Request() req) {
    return this.leaveService.approve(approvalDto, req);
  }
  @Post('reject')
  reject(@Body() approvalDto: ApprovalDto, @Request() req) {
    return this.leaveService.reject(approvalDto, req);
  }
  @Get()
  findAll() {
    return this.leaveService.findAll();
  }

  @Get(':leaveId')
  findOne(@Param('leaveId') leaveId: string) {
    return this.leaveService.findOne(leaveId);
  }

  @Patch(':leaveId')
  update(@Param('leaveId') leaveId: string, @Body() updateLeaveDto: UpdateLeaveDto) {
    return this.leaveService.update(leaveId, updateLeaveDto);
  }

  @Delete(':leaveId')
  remove(@Param('leaveId') leaveId: string) {
    return this.leaveService.remove(leaveId);
  }
}
