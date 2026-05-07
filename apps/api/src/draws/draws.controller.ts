import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentTenant } from '../tenants/decorators/current-tenant.decorator';
import { TenantAccessGuard } from '../tenants/guards/tenant-access.guard';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { CompleteDrawSessionDto } from './dto/complete-draw-session.dto';
import { CancelDrawSessionDto } from './dto/cancel-draw-session.dto';
import { ListDrawSessionsDto } from './dto/list-draw-sessions.dto';
import { RedrawPrizeDto } from './dto/redraw-prize.dto';
import { StartDrawSessionDto } from './dto/start-draw-session.dto';
import { DrawsService } from './draws.service';

@ApiTags('Draws')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('draws')
export class DrawsController {
  constructor(private readonly drawsService: DrawsService) {}

  @Get('sessions')
  @ApiOperation({ summary: 'List draw sessions in current tenant' })
  @ApiOkResponse({ description: 'Draw sessions returned.' })
  listSessions(
    @CurrentTenant() tenant: TenantContext,
    @Query() query: ListDrawSessionsDto,
  ) {
    return this.drawsService.listSessions(tenant, query);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Start a draw session' })
  @ApiBody({ type: StartDrawSessionDto })
  @ApiOkResponse({ description: 'Draw session started.' })
  @ApiBadRequestResponse({
    description: 'Invalid event or another session is running.',
  })
  startSession(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() actor: JwtPayload,
    @Body() dto: StartDrawSessionDto,
  ) {
    return this.drawsService.startSession(tenant, actor, dto);
  }

  @Post('sessions/:sessionId/complete')
  @ApiOperation({
    summary: 'Complete a running draw session and persist winners',
  })
  @ApiBody({ type: CompleteDrawSessionDto })
  @ApiOkResponse({ description: 'Draw session completed.' })
  @ApiBadRequestResponse({
    description: 'Invalid winners payload or session status.',
  })
  @ApiNotFoundResponse({ description: 'Session not found.' })
  completeSession(
    @CurrentTenant() tenant: TenantContext,
    @Param('sessionId') sessionId: string,
    @Body() dto: CompleteDrawSessionDto,
  ) {
    return this.drawsService.completeSession(tenant, sessionId, dto);
  }

  @Get('sessions/:sessionId/results')
  @ApiOperation({ summary: 'Get draw results for one session' })
  @ApiOkResponse({ description: 'Session results returned.' })
  @ApiNotFoundResponse({ description: 'Session not found.' })
  sessionResults(
    @CurrentTenant() tenant: TenantContext,
    @Param('sessionId') sessionId: string,
  ) {
    return this.drawsService.sessionResults(tenant, sessionId);
  }

  @Get('sessions/:sessionId/summary')
  @ApiOperation({ summary: 'Get aggregated draw summary for one session' })
  @ApiOkResponse({ description: 'Session summary returned.' })
  @ApiNotFoundResponse({ description: 'Session not found.' })
  sessionSummary(
    @CurrentTenant() tenant: TenantContext,
    @Param('sessionId') sessionId: string,
  ) {
    return this.drawsService.sessionSummary(tenant, sessionId);
  }

  @Post('sessions/:sessionId/cancel')
  @ApiOperation({ summary: 'Cancel a pending/running session' })
  @ApiBody({ type: CancelDrawSessionDto })
  @ApiOkResponse({ description: 'Session canceled.' })
  @ApiBadRequestResponse({
    description: 'Only pending/running sessions can be canceled.',
  })
  @ApiNotFoundResponse({ description: 'Session not found.' })
  cancelSession(
    @CurrentTenant() tenant: TenantContext,
    @Param('sessionId') sessionId: string,
    @Body() dto: CancelDrawSessionDto,
  ) {
    return this.drawsService.cancelSession(tenant, sessionId, dto);
  }

  @Post('sessions/:sessionId/redraw')
  @ApiOperation({ summary: 'Redraw one prize in a completed session' })
  @ApiBody({ type: RedrawPrizeDto })
  @ApiOkResponse({ description: 'Prize winners redrawn.' })
  @ApiBadRequestResponse({
    description: 'Invalid redraw payload or session status.',
  })
  @ApiNotFoundResponse({ description: 'Session or prize not found.' })
  redrawPrize(
    @CurrentTenant() tenant: TenantContext,
    @Param('sessionId') sessionId: string,
    @Body() dto: RedrawPrizeDto,
  ) {
    return this.drawsService.redrawPrize(tenant, sessionId, dto);
  }
}
