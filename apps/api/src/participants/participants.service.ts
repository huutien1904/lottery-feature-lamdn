import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as XLSX from 'xlsx';

import { PlanPolicyService } from '../subscriptions/plan-policy.service';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { ImportParticipantsDto } from './dto/import-participants.dto';
import { ListParticipantsDto } from './dto/list-participants.dto';
import { UpdateParticipantAvatarDto } from './dto/update-participant-avatar.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planPolicy: PlanPolicyService,
  ) {}

  async list(tenant: TenantContext, query: ListParticipantsDto) {
    return this.prisma.participant.findMany({
      where: {
        tenantId: tenant.tenantId,
        ...(query.eventId ? { eventId: query.eventId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenant: TenantContext, dto: CreateParticipantDto) {
    await this.assertEventInTenant(dto.eventId, tenant.tenantId);
    const existingCount = await this.prisma.participant.count({
      where: { tenantId: tenant.tenantId, eventId: dto.eventId },
    });
    await this.planPolicy.assertParticipantLimit(
      tenant.tenantId,
      existingCount + 1,
    );

    if (dto.avatarUrl || dto.avatarKey) {
      await this.planPolicy.assertAvatarUploadAllowed(tenant.tenantId);
    }

    return this.prisma.participant.create({
      data: {
        tenantId: tenant.tenantId,
        eventId: dto.eventId,
        participantCode: dto.participantCode,
        fullName: dto.fullName,
        department: dto.department,
        email: dto.email,
        avatarUrl: dto.avatarUrl,
        avatarKey: dto.avatarKey,
      },
    });
  }

  async importJson(tenant: TenantContext, dto: ImportParticipantsDto) {
    await this.assertEventInTenant(dto.eventId, tenant.tenantId);
    const existingCount = await this.prisma.participant.count({
      where: { tenantId: tenant.tenantId, eventId: dto.eventId },
    });
    await this.planPolicy.assertParticipantLimit(
      tenant.tenantId,
      existingCount + dto.participants.length,
    );

    const duplicatedInPayload = this.findDuplicatedCodes(
      dto.participants.map((p) => p.participantCode),
    );
    if (duplicatedInPayload.length > 0) {
      throw new BadRequestException(
        `Duplicate participantCode in payload: ${duplicatedInPayload.join(', ')}`,
      );
    }

    const created = await this.prisma.$transaction(
      dto.participants.map((item) =>
        this.prisma.participant.create({
          data: {
            tenantId: tenant.tenantId,
            eventId: dto.eventId,
            participantCode: item.participantCode,
            fullName: item.fullName,
            department: item.department,
            email: item.email,
          },
          select: { id: true },
        }),
      ),
    );

    return {
      imported: created.length,
      eventId: dto.eventId,
    };
  }

  async importExcel(
    tenant: TenantContext,
    eventId: string,
    file: { buffer: Buffer; originalname: string },
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Excel file is empty.');
    }
    const filename = file.originalname?.toLowerCase() ?? '';
    if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) {
      throw new BadRequestException('Only .xlsx/.xls files are supported.');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new BadRequestException('Excel file has no sheet.');
    }
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    });
    if (rows.length === 0) {
      throw new BadRequestException('Excel file has no data rows.');
    }

    const participants = rows.map((row, index) => {
      const participantCode = this.pickValue(row, [
        'participantCode',
        'participant_code',
        'code',
        'ma',
      ]);
      const fullName = this.pickValue(row, [
        'fullName',
        'full_name',
        'name',
        'hoTen',
      ]);
      const department = this.pickValue(row, [
        'department',
        'dept',
        'phongBan',
      ]);
      const email = this.pickValue(row, ['email']);

      if (!participantCode || !fullName) {
        throw new BadRequestException(
          `Row ${index + 2}: participantCode and fullName are required.`,
        );
      }

      return {
        participantCode,
        fullName,
        department: department || undefined,
        email: email || undefined,
      };
    });

    return this.importJson(tenant, {
      eventId,
      participants,
    });
  }

  downloadImportTemplate() {
    const rows = [
      {
        participantCode: 'EMP001',
        fullName: 'Nguyen Van A',
        department: 'Sales',
        email: 'a@example.com',
      },
      {
        participantCode: 'EMP002',
        fullName: 'Tran Thi B',
        department: 'Marketing',
        email: 'b@example.com',
      },
    ];
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'participants');
    const bytes = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
    }) as Uint8Array;
    return Buffer.from(bytes);
  }

  async updateAvatar(
    tenant: TenantContext,
    participantId: string,
    dto: UpdateParticipantAvatarDto,
  ) {
    await this.planPolicy.assertAvatarUploadAllowed(tenant.tenantId);
    const target = await this.prisma.participant.findFirst({
      where: { id: participantId, tenantId: tenant.tenantId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('Participant not found.');
    }

    return this.prisma.participant.update({
      where: { id: participantId },
      data: {
        avatarUrl: dto.avatarUrl,
        avatarKey: dto.avatarKey,
      },
    });
  }

  async remove(tenant: TenantContext, participantId: string) {
    const target = await this.prisma.participant.findFirst({
      where: { id: participantId, tenantId: tenant.tenantId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('Participant not found.');
    }
    await this.prisma.participant.delete({ where: { id: participantId } });
    return { removed: true };
  }

  private async assertEventInTenant(eventId: string, tenantId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, tenantId },
      select: { id: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found in tenant.');
    }
  }

  private findDuplicatedCodes(codes: string[]) {
    const seen = new Set<string>();
    const dup = new Set<string>();
    for (const code of codes) {
      if (seen.has(code)) dup.add(code);
      seen.add(code);
    }
    return [...dup];
  }

  private pickValue(row: Record<string, unknown>, keys: string[]) {
    const normalizedMap = new Map<string, unknown>();
    for (const [k, v] of Object.entries(row)) {
      normalizedMap.set(k.trim().toLowerCase(), v);
    }

    for (const key of keys) {
      const value = normalizedMap.get(key.toLowerCase());
      if (value === undefined || value === null) continue;
      let text = '';
      if (typeof value === 'string') text = value.trim();
      else if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint'
      ) {
        text = value.toString().trim();
      } else {
        continue;
      }
      if (text) return text;
    }
    return '';
  }
}
