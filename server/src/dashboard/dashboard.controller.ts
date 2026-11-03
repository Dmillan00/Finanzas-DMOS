import { Controller, Get } from '@nestjs/common';

import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  private readonly dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  @Get()
  async getDashboard() {
    try {
      return await this.dashboardService.getDashboard();
    } catch (error) {
      console.error('Error al mostrar el dashboard:', error);
      throw error;
    }
  }
}
