/*
* dashboard.component.ts
* This component fetches dashboard statistics and binds them to the template.
*/
import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexLegend,
  ApexFill,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { MatButtonModule } from '@angular/material/button';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BaseChartDirective } from 'ng2-charts';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { DashboardService, DashboardStats } from './dashboard.service'; // Assuming service is in the same folder
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AuthService } from '@core/service/auth.service';

export type barChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  responsive: ApexResponsive[];
  xaxis: ApexXAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  fill: ApexFill;
};

export type areaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  grid: ApexGrid;
  colors: string[];
};

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    imports: [
        CommonModule,
        DatePipe,
        BreadcrumbComponent,
        BaseChartDirective,
        MatProgressBarModule,
        NgApexchartsModule,
        NgScrollbar,
        MatButtonModule,
        FeatherIconsComponent,
    ]
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public barChartOptions!: Partial<barChartOptions>;
  public areaChartOptions!: Partial<areaChartOptions>;

  public dashboardStats: DashboardStats | null = null;
  public username: string;
  public topicCompletionPercentage = 0;

  breadscrums = [
    {
      title: 'Dashboard',
      items: ['Home'],
      active: 'Dashboard',
    },
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
    // Fetch username from AuthService
    this.username = this.authService.currentUserValue.name || 'User';
  }

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  public doughnutChartLabels: string[] = ['Completed', 'Pending'];
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [0, 0], // Initial data
        backgroundColor: ['#4CAF50', '#F44336'],
        borderColor: 'transparent',
      },
    ],
  };
  public doughnutChartType: ChartType = 'doughnut';

  ngOnInit() {
    this.loadDashboardData();
    // Initialize charts with placeholder configurations
    this.initializeAreaChart();
    this.initializeBarChart();
  }

  loadDashboardData() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        this.dashboardStats = response.data;
        this.updateUIAndCharts();
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
      }
    });
  }

  updateUIAndCharts() {
    if (!this.dashboardStats) {
      return;
    }

    // Calculate percentage for the welcome message
    if (this.dashboardStats.topics.total > 0) {
        this.topicCompletionPercentage = Math.round((this.dashboardStats.topics.completed / this.dashboardStats.topics.total) * 100);
    }

    // Update Doughnut Chart for Topic Progress
    const completed = this.dashboardStats.topics.completed;
    const pending = this.dashboardStats.topics.total - completed;
    this.doughnutChartData.datasets[0].data = [completed, pending];

    // Update Area Chart for Mock Interview Results
    const recentScores = this.dashboardStats.mockInterviews.recentScores || [];
    this.areaChartOptions.series = [{
      name: 'Score',
      data: recentScores.map(item => item.score)
    }];
    this.areaChartOptions.xaxis = {
      categories: recentScores.map(item => new Date(item.createdAt).toLocaleDateString())
    };

    // Update Bar Chart for Time Spent On Learning
    if (this.dashboardStats.learningTimeChart) {
      this.barChartOptions.series = this.dashboardStats.learningTimeChart.series;
      this.barChartOptions.xaxis = {
          ...this.barChartOptions.xaxis, // Preserve other xaxis settings
          categories: this.dashboardStats.learningTimeChart.categories
      };
    }
  }

  private initializeAreaChart() {
    this.areaChartOptions = {
      series: [],
      chart: {
        height: 350,
        type: 'area',
        toolbar: { show: false },
        foreColor: '#9aa0ac',
      },
      colors: ['#F77A9A', '#A054F7'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      xaxis: { categories: [] },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
      },
    };
  }

  private initializeBarChart() {
    this.barChartOptions = {
      series: [], 
      chart: {
        type: 'bar',
        height: 330,
        foreColor: '#9aa0ac',
        stacked: false, 
        toolbar: { show: false },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: { position: 'bottom', offsetX: -10, offsetY: 0 },
          },
        },
      ],
      plotOptions: { bar: { horizontal: false, columnWidth: '40%' } },
      dataLabels: { enabled: false },
      xaxis: {
        type: 'category',
        categories: [], 
      },
      legend: { show: false },
      grid: { show: true, borderColor: '#9aa0ac', strokeDashArray: 1 },
      fill: {
        opacity: 1,
        colors: ['#25B9C1'], 
      },
    };
  }
}
