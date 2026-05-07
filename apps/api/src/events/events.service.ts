import { Injectable, NotFoundException } from '@nestjs/common';

import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  listEvents(tenant: TenantContext) {
    return this.prisma.event.findMany({
      where: { tenantId: tenant.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEvent(tenant: TenantContext, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, tenantId: tenant.tenantId },
      include: {
        prizes: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!event) throw new NotFoundException('Event not found.');
    return event;
  }

  createEvent(tenant: TenantContext, actor: JwtPayload, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        tenantId: tenant.tenantId,
        createdById: actor.sub,
        name: dto.name,
        code: dto.code,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  }

  async updateEvent(
    tenant: TenantContext,
    eventId: string,
    dto: UpdateEventDto,
  ) {
    await this.ensureEvent(tenant.tenantId, eventId);
    return this.prisma.event.update({
      where: { id: eventId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.startsAt !== undefined
          ? { startsAt: dto.startsAt ? new Date(dto.startsAt) : null }
          : {}),
        ...(dto.endsAt !== undefined
          ? { endsAt: dto.endsAt ? new Date(dto.endsAt) : null }
          : {}),
      },
    });
  }

  async updateEventStatus(
    tenant: TenantContext,
    eventId: string,
    dto: UpdateEventStatusDto,
  ) {
    await this.ensureEvent(tenant.tenantId, eventId);
    return this.prisma.event.update({
      where: { id: eventId },
      data: { status: dto.status },
    });
  }

  async deleteEvent(tenant: TenantContext, eventId: string) {
    await this.ensureEvent(tenant.tenantId, eventId);
    await this.prisma.event.delete({ where: { id: eventId } });
    return { removed: true };
  }

  listPrizes(tenant: TenantContext, eventId: string) {
    return this.prisma.prize.findMany({
      where: { tenantId: tenant.tenantId, eventId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createPrize(
    tenant: TenantContext,
    eventId: string,
    dto: CreatePrizeDto,
  ) {
    await this.ensureEvent(tenant.tenantId, eventId);
    return this.prisma.prize.create({
      data: {
        tenantId: tenant.tenantId,
        eventId,
        code: dto.code,
        name: dto.name,
        quantity: dto.quantity,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updatePrize(
    tenant: TenantContext,
    eventId: string,
    prizeId: string,
    dto: UpdatePrizeDto,
  ) {
    await this.ensureEvent(tenant.tenantId, eventId);
    const prize = await this.prisma.prize.findFirst({
      where: { id: prizeId, tenantId: tenant.tenantId, eventId },
      select: { id: true },
    });
    if (!prize) throw new NotFoundException('Prize not found.');
    return this.prisma.prize.update({
      where: { id: prizeId },
      data: {
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.quantity !== undefined ? { quantity: dto.quantity } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  async deletePrize(tenant: TenantContext, eventId: string, prizeId: string) {
    await this.ensureEvent(tenant.tenantId, eventId);
    const prize = await this.prisma.prize.findFirst({
      where: { id: prizeId, tenantId: tenant.tenantId, eventId },
      select: { id: true },
    });
    if (!prize) throw new NotFoundException('Prize not found.');
    await this.prisma.prize.delete({ where: { id: prizeId } });
    return { removed: true };
  }

  private async ensureEvent(tenantId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, tenantId },
      select: { id: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found.');
    }
  }
}
