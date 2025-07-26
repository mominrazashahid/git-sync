import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
  RowSelectionOptions,
  GridApi,
} from 'ag-grid-community';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GitService } from '../git.service';
import { SharedModule } from '../../app/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-data-viewer',
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss'],
  imports: [SharedModule],
})
export class DataViewerComponent implements OnInit {
  // Form Controls
  integrationControl = new FormControl('github');
  entityControl = new FormControl(''); 
  processEntityControl = new FormControl('commits');
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
  private gridApi!: GridApi;
  rowData: any[] = [];
  allApiData: any = {}; // Store all API response data
  columnDefs: ColDef[] = [];
  loading = false;
   rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "singleRow",
  };

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  constructor(
    private gitService: GitService, 
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

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
      this.setupColumnDefs();
      this.filterAndDisplayData();
    });
  }

  deleteRow(){
    if(!this.gridApi){
      this.snackBar.open('Grid API not available', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const selectedData = this.gridApi.getSelectedRows();
    
    if(selectedData.length === 0){
      this.snackBar.open('No row selected for deletion', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    // Remove selected rows from the grid
    this.gridApi.applyTransaction({ remove: selectedData });
    
    // Update the row data array
    this.rowData = this.rowData.filter(row => 
      !selectedData.some(selected => selected === row)
    );
    
    // Show success message
    this.snackBar.open(
      `${selectedData.length} row(s) deleted successfully`, 
      'Close', 
      {
        duration: 3000,
        panelClass: ['success-snackbar']
      }
    );
    
    this.cdr.detectChanges();
  }

  onGridReady(_event: GridReadyEvent) {
   this.gridApi = _event.api;
  


  }

  setupSearchDebounce() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadData();
      });
  }

  isDisabledDelBtn(){
    if(!this.gridApi){
      return true;
    }
    
    const selectedData = this.gridApi.getSelectedRows();
    return selectedData.length === 0;
  }

  setupColumnDefs() {
    const processEntity = this.processEntityControl.value;
    if (processEntity) {
      this.columnDefs = this.gitService.setupColumnDefs(processEntity);
    }
  }

  loadData() {
    const entity = this.entityControl.value;
    const search = this.searchControl.value;
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
