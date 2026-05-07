import {
  Body,
  Controller,
  Delete,
  Get,
  ParseFilePipe,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/decorators/current-tenant.decorator';
import { TenantAccessGuard } from '../tenants/guards/tenant-access.guard';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ImportParticipantsDto } from './dto/import-participants.dto';
import { ImportExcelDto } from './dto/import-excel.dto';
import { ListParticipantsDto } from './dto/list-participants.dto';
import { UpdateParticipantAvatarDto } from './dto/update-participant-avatar.dto';
import { ParticipantsService } from './participants.service';

@ApiTags('Participants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Get()
  list(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListParticipantsDto,
  ) {
    return this.participantsService.list(tenant, query);
  }

  @Get('import-template')
  importTemplate(@Res({ passthrough: true }) res: Response) {
    const file = this.participantsService.downloadImportTemplate();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="participants-import-template.xlsx"',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    return new StreamableFile(file);
  }

  @Post()
  create(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateParticipantDto,
  ) {
    return this.participantsService.create(tenant, dto);
  }

  @Post('import-json')
  importJson(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ImportParticipantsDto,
  ) {
    return this.participantsService.importJson(tenant, dto);
  }

  @Post('import-excel')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['eventId', 'file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importExcel(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: ImportExcelDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: { buffer: Buffer; originalname: string },
  ) {
    return this.participantsService.importExcel(tenant, dto.eventId, file);
  }

  @Patch(':participantId/avatar')
  updateAvatar(
    @CurrentTenant() tenant: TenantContext,
    @Param('participantId') participantId: string,
    @Body() dto: UpdateParticipantAvatarDto,
  ) {
    return this.participantsService.updateAvatar(tenant, participantId, dto);
  }

  @Delete(':participantId')
  remove(
    @CurrentTenant() tenant: TenantContext,
    @Param('participantId') participantId: string,
  ) {
    return this.participantsService.remove(tenant, participantId);
  }
}
