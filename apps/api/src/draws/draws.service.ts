import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrawSessionStatus } from '@prisma/client';

import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { CompleteDrawSessionDto } from './dto/complete-draw-session.dto';
import { CancelDrawSessionDto } from './dto/cancel-draw-session.dto';
import { ListDrawSessionsDto } from './dto/list-draw-sessions.dto';
import { RedrawPrizeDto } from './dto/redraw-prize.dto';
import { StartDrawSessionDto } from './dto/start-draw-session.dto';

@Injectable()
export class DrawsService {
  constructor(private readonly prisma: PrismaService) {}

  async listSessions(tenant: TenantContext, query: ListDrawSessionsDto) {
    return this.prisma.drawSession.findMany({
      where: {
        tenantId: tenant.tenantId,
        ...(query.eventId ? { eventId: query.eventId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async startSession(
    tenant: TenantContext,
    actor: JwtPayload,
    dto: StartDrawSessionDto,
  ) {
    await this.assertEventInTenant(dto.eventId, tenant.tenantId);

    const opened = await this.prisma.drawSession.findFirst({
      where: {
        tenantId: tenant.tenantId,
        eventId: dto.eventId,
        status: DrawSessionStatus.RUNNING,
      },
      select: { id: true },
    });
    if (opened) {
      throw new BadRequestException('Another draw session is already running.');
    }

    return this.prisma.drawSession.create({
      data: {
        tenantId: tenant.tenantId,
        eventId: dto.eventId,
        createdById: actor.sub,
        status: DrawSessionStatus.RUNNING,
        startedAt: new Date(),
        notes: dto.notes,
      },
    });
  }

  async completeSession(
    tenant: TenantContext,
    sessionId: string,
    dto: CompleteDrawSessionDto,
  ) {
    const session = await this.prisma.drawSession.findFirst({
      where: { id: sessionId, tenantId: tenant.tenantId },
      select: { id: true, eventId: true, status: true },
    });
    if (!session) {
      throw new NotFoundException('Draw session not found.');
    }
    if (session.status !== DrawSessionStatus.RUNNING) {
      throw new BadRequestException('Only RUNNING session can be completed.');
    }

    const participantIds = [
      ...new Set(dto.results.map((x) => x.participantId)),
    ];
    const prizeIds = [...new Set(dto.results.map((x) => x.prizeId))];

    const [participants, prizes] = await Promise.all([
      this.prisma.participant.findMany({
        where: {
          tenantId: tenant.tenantId,
          eventId: session.eventId,
          id: { in: participantIds },
        },
        select: { id: true },
      }),
      this.prisma.prize.findMany({
        where: {
          tenantId: tenant.tenantId,
          eventId: session.eventId,
          id: { in: prizeIds },
        },
        select: { id: true, quantity: true },
      }),
    ]);

    if (participants.length !== participantIds.length) {
      throw new BadRequestException(
        'One or more participants are invalid for this event.',
      );
    }
    if (prizes.length !== prizeIds.length) {
      throw new BadRequestException(
        'One or more prizes are invalid for this event.',
      );
    }

    const duplicatedWinnerIds = this.findDuplicates(
      dto.results.map((x) => x.participantId),
    );
    if (duplicatedWinnerIds.length > 0) {
      throw new BadRequestException(
        `Duplicate participant winners in payload: ${duplicatedWinnerIds.join(', ')}`,
      );
    }

    const winnersPerPrize = new Map<string, number>();
    for (const item of dto.results) {
      winnersPerPrize.set(
        item.prizeId,
        (winnersPerPrize.get(item.prizeId) ?? 0) + 1,
      );
    }
    for (const prize of prizes) {
      const requested = winnersPerPrize.get(prize.id) ?? 0;
      if (requested > prize.quantity) {
        throw new BadRequestException(
          `Prize ${prize.id} exceeded quantity. Requested ${requested}, max ${prize.quantity}.`,
        );
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.drawResult.createMany({
        data: dto.results.map((item) => ({
          tenantId: tenant.tenantId,
          eventId: session.eventId,
          drawSessionId: session.id,
          participantId: item.participantId,
          prizeId: item.prizeId,
          rankNo: item.rankNo,
        })),
      });

      await tx.drawSession.update({
        where: { id: session.id },
        data: {
          status: DrawSessionStatus.COMPLETED,
          endedAt: new Date(),
          notes: dto.notes ?? undefined,
        },
      });
    });

    return {
      completed: true,
      sessionId: session.id,
      totalWinners: dto.results.length,
    };
  }

  async sessionResults(tenant: TenantContext, sessionId: string) {
    const session = await this.prisma.drawSession.findFirst({
      where: { id: sessionId, tenantId: tenant.tenantId },
      select: {
        id: true,
        eventId: true,
        status: true,
        startedAt: true,
        endedAt: true,
        notes: true,
      },
    });
    if (!session) {
      throw new NotFoundException('Draw session not found.');
    }

    const results = await this.prisma.drawResult.findMany({
      where: { drawSessionId: session.id, tenantId: tenant.tenantId },
      orderBy: [{ createdAt: 'asc' }],
      include: {
        participant: {
          select: { id: true, participantCode: true, fullName: true },
        },
        prize: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return { session, results };
  }

  async sessionSummary(tenant: TenantContext, sessionId: string) {
    const session = await this.prisma.drawSession.findFirst({
      where: { id: sessionId, tenantId: tenant.tenantId },
      select: {
        id: true,
        eventId: true,
        status: true,
        startedAt: true,
        endedAt: true,
      },
    });
    if (!session) {
      throw new NotFoundException('Draw session not found.');
    }

    const [prizes, results] = await Promise.all([
      this.prisma.prize.findMany({
        where: { tenantId: tenant.tenantId, eventId: session.eventId },
        select: { id: true, code: true, name: true, quantity: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.drawResult.findMany({
        where: { tenantId: tenant.tenantId, drawSessionId: session.id },
        select: { prizeId: true, participantId: true },
      }),
    ]);

    const winsByPrize = new Map<string, Set<string>>();
    for (const r of results) {
      if (!winsByPrize.has(r.prizeId))
        winsByPrize.set(r.prizeId, new Set<string>());
      winsByPrize.get(r.prizeId)?.add(r.participantId);
    }

    const prizeStats = prizes.map((p) => {
      const wonCount = winsByPrize.get(p.id)?.size ?? 0;
      return {
        prizeId: p.id,
        code: p.code,
        name: p.name,
        quantity: p.quantity,
        wonCount,
        remainingCount: Math.max(0, p.quantity - wonCount),
      };
    });

    return {
      session,
      totals: {
        totalPrizes: prizes.length,
        totalWinners: results.length,
        uniqueWinners: new Set(results.map((r) => r.participantId)).size,
      },
      prizeStats,
    };
  }

  async cancelSession(
    tenant: TenantContext,
    sessionId: string,
    dto: CancelDrawSessionDto,
  ) {
    const session = await this.prisma.drawSession.findFirst({
      where: { id: sessionId, tenantId: tenant.tenantId },
      select: { id: true, status: true, notes: true },
    });
    if (!session) {
      throw new NotFoundException('Draw session not found.');
    }
    if (
      session.status !== DrawSessionStatus.PENDING &&
      session.status !== DrawSessionStatus.RUNNING
    ) {
      throw new BadRequestException(
        'Only PENDING or RUNNING sessions can be canceled.',
      );
    }

    await this.prisma.drawSession.update({
      where: { id: session.id },
      data: {
        status: DrawSessionStatus.CANCELED,
        endedAt: new Date(),
        notes: [session.notes, dto.reason].filter(Boolean).join('\n'),
      },
    });
    return { canceled: true, sessionId: session.id };
  }

  async redrawPrize(
    tenant: TenantContext,
    sessionId: string,
    dto: RedrawPrizeDto,
  ) {
    const session = await this.prisma.drawSession.findFirst({
      where: { id: sessionId, tenantId: tenant.tenantId },
      select: { id: true, status: true, eventId: true, notes: true },
    });
    if (!session) {
      throw new NotFoundException('Draw session not found.');
    }
    if (session.status !== DrawSessionStatus.COMPLETED) {
      throw new BadRequestException('Only COMPLETED sessions can be redrawn.');
    }

    const prize = await this.prisma.prize.findFirst({
      where: {
        id: dto.prizeId,
        tenantId: tenant.tenantId,
        eventId: session.eventId,
      },
      select: { id: true, quantity: true },
    });
    if (!prize) {
      throw new NotFoundException('Prize not found in this event.');
    }
    if (dto.winners.length > prize.quantity) {
      throw new BadRequestException(
        `Redraw winners exceed prize quantity: max ${prize.quantity}.`,
      );
    }

    const winnerIds = dto.winners.map((w) => w.participantId);
    const duplicates = this.findDuplicates(winnerIds);
    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Duplicate participant winners in payload: ${duplicates.join(', ')}`,
      );
    }

    const participants = await this.prisma.participant.findMany({
      where: {
        id: { in: winnerIds },
        tenantId: tenant.tenantId,
        eventId: session.eventId,
      },
      select: { id: true },
    });
    if (participants.length !== winnerIds.length) {
      throw new BadRequestException(
        'One or more participants are invalid for this event.',
      );
    }

    const existingOtherPrizeWinners = await this.prisma.drawResult.findMany({
      where: {
        drawSessionId: session.id,
        tenantId: tenant.tenantId,
        prizeId: { not: dto.prizeId },
        participantId: { in: winnerIds },
      },
      select: { participantId: true },
    });
    if (existingOtherPrizeWinners.length > 0) {
      throw new BadRequestException(
        'Some participants already won another prize in this session.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.drawResult.deleteMany({
        where: {
          drawSessionId: session.id,
          tenantId: tenant.tenantId,
          prizeId: dto.prizeId,
        },
      });
      await tx.drawResult.createMany({
        data: dto.winners.map((w) => ({
          tenantId: tenant.tenantId,
          eventId: session.eventId,
          drawSessionId: session.id,
          participantId: w.participantId,
          prizeId: dto.prizeId,
          rankNo: w.rankNo,
        })),
      });
      if (dto.reason) {
        await tx.drawSession.update({
          where: { id: session.id },
          data: {
            notes: [session.notes, `REDRAW(${dto.prizeId}): ${dto.reason}`]
              .filter(Boolean)
              .join('\n'),
          },
        });
      }
    });

    return {
      redrawn: true,
      sessionId: session.id,
      prizeId: dto.prizeId,
      winners: dto.winners.length,
    };
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

  private findDuplicates(values: string[]) {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) duplicates.add(value);
      seen.add(value);
    }
    return [...duplicates];
  }
}
