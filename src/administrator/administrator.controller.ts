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
import { AdministratorService } from './administrator.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Administrator Control')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('administrator')
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Post('create-employee')
  create(
    @Body() createAdministratorDto: CreateAdministratorDto,
    @Request() req,
  ) {
    return this.administratorService.create(createAdministratorDto, req);
  }

  @Get('eployees')
  findAll(@Request() req) {
    return this.administratorService.findAll(req);
  }

  @Get(':employId')
  findOne(@Param('employId') id: string, @Request() req) {
    return this.administratorService.findOne(id, req);
  }

  @Patch(':employId')
  update(
    @Param('employId') id: string,
    @Body() updateAdministratorDto: UpdateAdministratorDto,
    @Request() req,
  ) {
    return this.administratorService.update(id, updateAdministratorDto, req);
  }

  @Delete(':employId')
  remove(@Param('employId') id: string, @Request() req) {
    return this.administratorService.remove(id, req);
  }
}
