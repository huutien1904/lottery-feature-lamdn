import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentTenant } from '../tenants/decorators/current-tenant.decorator';
import { TenantAccessGuard } from '../tenants/guards/tenant-access.guard';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'List events in current tenant' })
  listEvents(@CurrentTenant() tenant: TenantContext) {
    return this.eventsService.listEvents(tenant);
  }

  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiBody({ type: CreateEventDto })
  createEvent(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() actor: JwtPayload,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.createEvent(tenant, actor, dto);
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Get event detail with prizes' })
  getEvent(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
  ) {
    return this.eventsService.getEvent(tenant, eventId);
  }

  @Patch(':eventId')
  @ApiOperation({ summary: 'Update event' })
  @ApiBody({ type: UpdateEventDto })
  updateEvent(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(tenant, eventId, dto);
  }

  @Patch(':eventId/status')
  @ApiOperation({ summary: 'Update event status' })
  @ApiBody({ type: UpdateEventStatusDto })
  updateStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventStatusDto,
  ) {
    return this.eventsService.updateEventStatus(tenant, eventId, dto);
  }

  @Delete(':eventId')
  @ApiOperation({ summary: 'Delete event' })
  deleteEvent(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
  ) {
    return this.eventsService.deleteEvent(tenant, eventId);
  }

  @Get(':eventId/prizes')
  @ApiOperation({ summary: 'List prizes in event' })
  listPrizes(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
  ) {
    return this.eventsService.listPrizes(tenant, eventId);
  }

  @Post(':eventId/prizes')
  @ApiOperation({ summary: 'Create prize in event' })
  @ApiBody({ type: CreatePrizeDto })
  createPrize(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
    @Body() dto: CreatePrizeDto,
  ) {
    return this.eventsService.createPrize(tenant, eventId, dto);
  }

  @Patch(':eventId/prizes/:prizeId')
  @ApiOperation({ summary: 'Update prize in event' })
  @ApiBody({ type: UpdatePrizeDto })
  updatePrize(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
    @Param('prizeId') prizeId: string,
    @Body() dto: UpdatePrizeDto,
  ) {
    return this.eventsService.updatePrize(tenant, eventId, prizeId, dto);
  }

  @Delete(':eventId/prizes/:prizeId')
  @ApiOperation({ summary: 'Delete prize in event' })
  deletePrize(
    @CurrentTenant() tenant: TenantContext,
    @Param('eventId') eventId: string,
    @Param('prizeId') prizeId: string,
  ) {
    return this.eventsService.deletePrize(tenant, eventId, prizeId);
  }
}
