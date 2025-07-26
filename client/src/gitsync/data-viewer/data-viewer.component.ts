import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
} from 'ag-grid-community';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GitService } from '../git.service';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    AgGridModule,
    ReactiveFormsModule,
  ],
})
export class DataViewerComponent implements OnInit {
  // Form Controls
  integrationControl = new FormControl('github');
  entityControl = new FormControl(''); // For API collection parameter
  processEntityControl = new FormControl('commits'); // For local data filtering/display
  searchControl = new FormControl('');

  // Dropdown Options
  integrationOptions = [{ value: 'github', label: 'GitHub' }];

  entityOptions = [
    { value: '', label: 'All Data' },
    { value: 'orgs', label: 'Organizations' },
    { value: 'repos', label: 'Repositories' },
    { value: 'commits', label: 'Commits' },
    { value: 'issues', label: 'Issues' },
    { value: 'pulls', label: 'Pull Requests' },
  ];

  processEntityOptions = [
    { value: 'orgs', label: 'Organizations' },
    { value: 'repos', label: 'Repositories' },
    { value: 'commits', label: 'Commits' },
    { value: 'issues', label: 'Issues' },
    { value: 'pulls', label: 'Pull Requests' },
  ];

  // AG Grid
  rowData: any[] = [];
  allApiData: any = {}; // Store all API response data
  columnDefs: ColDef[] = [];
  loading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  constructor(private gitService: GitService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.setupColumnDefs();
    this.setupSearchDebounce();
    this.loadData();

    // Listen to entity changes (API collection parameter)
    this.entityControl.valueChanges.subscribe((value) => {
      console.log('Entity changed to:', value);
      this.currentPage = 1;
      this.loadData();
    });

    // Listen to process entity changes (local data filtering)
    this.processEntityControl.valueChanges.subscribe((value) => {
      console.log('Process entity changed to:', value);
      this.setupColumnDefs();
      this.filterAndDisplayData();
    });
  }

  onGridReady(_event: GridReadyEvent) {
    // Grid ready - can add future functionality here if needed
  }

  setupSearchDebounce() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadData();
      });
  }

  setupColumnDefs() {
    const processEntity = this.processEntityControl.value;

    switch (processEntity) {
      case 'orgs':
        this.columnDefs = [
          {
            field: 'login',
            headerName: 'Login',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            flex: 2,
          },
          {
            field: 'url',
            headerName: 'URL',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'id',
            headerName: 'ID',
            sortable: true,
            filter: true,
            width: 100,
          },
        ];
        break;

      case 'repos':
        this.columnDefs = [
          {
            field: 'name',
            headerName: 'Name',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'full_name',
            headerName: 'Full Name',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'description',
            headerName: 'Description',
            sortable: true,
            filter: true,
            flex: 2,
          },
          {
            field: 'language',
            headerName: 'Language',
            sortable: true,
            filter: true,
            width: 120,
          },
          {
            field: 'stargazers_count',
            headerName: 'Stars',
            sortable: true,
            filter: true,
            width: 100,
          },
          {
            field: 'forks_count',
            headerName: 'Forks',
            sortable: true,
            filter: true,
            width: 100,
          },
          {
            field: 'private',
            headerName: 'Private',
            sortable: true,
            filter: true,
            width: 100,
          },
        ];
        break;

      case 'commits':
        this.columnDefs = [
          {
            field: 'sha',
            headerName: 'SHA',
            sortable: true,
            filter: true,
            width: 150,
          },
          {
            field: 'message',
            headerName: 'Message',
            sortable: true,
            filter: true,
            flex: 2,
          },
          {
            field: 'author.name',
            headerName: 'Author',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'author.email',
            headerName: 'Author Email',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'author.date',
            headerName: 'Date',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: (params: any) =>
              params.value ? new Date(params.value).toLocaleDateString() : '',
          },
          {
            field: 'repo_name',
            headerName: 'Repository',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'org_login',
            headerName: 'Organization',
            sortable: true,
            filter: true,
            flex: 1,
          },
        ];
        break;

      case 'issues':
        this.columnDefs = [
          {
            field: 'number',
            headerName: '#',
            sortable: true,
            filter: true,
            width: 80,
          },
          {
            field: 'title',
            headerName: 'Title',
            sortable: true,
            filter: true,
            flex: 2,
          },
          {
            field: 'state',
            headerName: 'State',
            sortable: true,
            filter: true,
            width: 100,
          },
          {
            field: 'user.login',
            headerName: 'Created By',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'created_at',
            headerName: 'Created',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: (params: any) =>
              params.value ? new Date(params.value).toLocaleDateString() : '',
          },
          {
            field: 'comments',
            headerName: 'Comments',
            sortable: true,
            filter: true,
            width: 100,
          },
        ];
        break;

      case 'pulls':
        this.columnDefs = [
          {
            field: 'number',
            headerName: '#',
            sortable: true,
            filter: true,
            width: 80,
          },
          {
            field: 'title',
            headerName: 'Title',
            sortable: true,
            filter: true,
            flex: 2,
          },
          {
            field: 'state',
            headerName: 'State',
            sortable: true,
            filter: true,
            width: 100,
          },
          {
            field: 'user.login',
            headerName: 'Created By',
            sortable: true,
            filter: true,
            flex: 1,
          },
          {
            field: 'created_at',
            headerName: 'Created',
            sortable: true,
            filter: true,
            width: 150,
            valueFormatter: (params: any) =>
              params.value ? new Date(params.value).toLocaleDateString() : '',
          },
          {
            field: 'merged',
            headerName: 'Merged',
            sortable: true,
            filter: true,
            width: 100,
            valueFormatter: (params: any) => (params.value ? 'Yes' : 'No'),
          },
          {
            field: 'repo_name',
            headerName: 'Repository',
            sortable: true,
            filter: true,
            flex: 1,
          },
        ];
        break;

      default:
        this.columnDefs = [];
    }
  }

  loadData() {
    const entity = this.entityControl.value;
    const search = this.searchControl.value;

    console.log(
      'Loading data for entity:',
      entity,
      'search:',
      search,
      'page:',
      this.currentPage
    );
    this.loading = true;

    this.gitService
      .getGithubData(
        entity || undefined,
        this.currentPage,
        this.pageSize,
        search || ''
      )
      .subscribe({
        next: (response: any) => {
          console.log(this.entityControl.value, 'value');

          if (this.entityControl.value?.trim() == '') {
            this.allApiData = response.results;
          } else if (
            this.entityControl.value?.trim() != '' &&
            typeof this.entityControl.value?.trim() === 'string'
          ) {
            this.allApiData = {
              [this.entityControl.value]: response[this.entityControl.value],
            };
          }

          this.totalRecords = response.total || 0;
          this.totalPages = response.totalPages || 0;
          this.loading = false;

          // Filter and display data based on process entity
          this.filterAndDisplayData();

          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading data:', error);
          this.loading = false;
          this.rowData = [];
          this.allApiData = {};
          this.totalRecords = 0;
          this.totalPages = 0;
          this.cdr.detectChanges();
        },
      });
  }

  filterAndDisplayData() {
    if (
      this.entityControl.value?.trim() != '' &&
      typeof this.entityControl.value?.trim() === 'string'
    ) {
      this.rowData = this.allApiData[this.entityControl.value];
      if (this.entityControl.value !== this.processEntityControl.value) {
        this.processEntityControl.setValue(this.entityControl.value);
      }
      return;
    }

    const processEntity = this.processEntityControl.value;
    if (!processEntity || !this.allApiData) {
      this.rowData = [];
      return;
    }

    // Display data based on selected process entity
    this.rowData = this.allApiData[processEntity] || [];
    this.cdr.detectChanges();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadData();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadData();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadData();
  }

  getPaginationInfo(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalRecords);
    return `${start}-${end} of ${this.totalRecords}`;
  }

  getSelectedEntityLabel(): string {
    const processEntity = this.processEntityControl.value;
    return (
      this.processEntityOptions.find((e) => e.value === processEntity)?.label ||
      'Data'
    );
  }
}
