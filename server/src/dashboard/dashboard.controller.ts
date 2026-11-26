import { Controller, Get } from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  private readonly dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  //Datos del dashboard
  @Get()
  getDashboard() {
    return this.dashboardService.getDashboard();
  }
}
