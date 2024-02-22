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
  Query,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import {
  ApprovalDto,
  BulkApprove,
  CommentOnLeaveDto,
  CreateLeaveDto,
} from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LeaveTypes } from './dto/leave-types.enum';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('Leaves')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @ApiQuery({ name: 'type', enum: LeaveTypes })
  create(
    @Query('type') type: LeaveTypes,
    @Body() createLeaveDto: CreateLeaveDto,
    @Request() req,
  ) {
    return this.leaveService.create(createLeaveDto, req, type);
  }
  @Post('commentOnLeave')
  commentOnLeave(@Body() commentOnLeaveDto: CommentOnLeaveDto, @Request() req) {
    return this.leaveService.commentOnLeave(commentOnLeaveDto, req);
  }
  @Post('approve')
  approve(@Body() approvalDto: ApprovalDto, @Request() req) {
    return this.leaveService.approve(approvalDto, req);
  }
  @Post('bulkapprove')
  bulkApprove(@Body() bulkApprove: BulkApprove, @Request() req) {
    return this.leaveService.bulkApprove(bulkApprove, req);
  }
  @Post('reject')
  reject(@Body() approvalDto: ApprovalDto, @Request() req) {
    return this.leaveService.reject(approvalDto, req);
  }
  @Post('bulkreject')
  bulkReject(@Body() bulkApprove: BulkApprove, @Request() req) {
    return this.leaveService.bulkReject(bulkApprove, req);
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
  @ApiQuery({ name: 'type', enum: LeaveTypes })
  update(
    @Param('leaveId') leaveId: string,
    @Body() updateLeaveDto: UpdateLeaveDto,
  ) {
    return this.leaveService.update(leaveId, updateLeaveDto);
  }

  @Delete(':leaveId')
  remove(@Param('leaveId') leaveId: string) {
    return this.leaveService.remove(leaveId);
  }
}
