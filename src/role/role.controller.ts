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
import { RoleService } from './role.service';
import { AssignRoleDto, CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Roles')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    return this.roleService.create(createRoleDto, req);
  }

  @Post('assign')
  assign(@Body() createRoleDto: AssignRoleDto, @Request() req) {
    return this.roleService.assign(createRoleDto, req);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req,
  ) {
    return this.roleService.update(id, updateRoleDto, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.roleService.remove(id, req);
  }
}
