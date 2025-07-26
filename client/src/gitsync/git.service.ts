import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GitService {
  private dataUrl = '/api/github/data';

  constructor(private http: HttpClient) {}


  getGithubData(collection: string | undefined, page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

      if(collection){
        params = params.set('collection', collection);
      }
      
      if(search.trim()){
        params = params.set('search', search.trim());
      }
    
    return this.http.get(this.dataUrl, { 
      params,
      observe: 'response'
    }).pipe(
      map((response: any) => response.body),
      catchError((error: any) => {
        console.error('HTTP Error details:', error);
        if (error.status === 401) {
          console.error('Authentication failed. Please login again.');
          // Optionally redirect to login or show auth error
        }
        throw error;
      })
    );
  }


  setupColumnDefs(processEntity: string){
    let columnDefs:any[] = [];
     switch (processEntity) {
      case 'orgs':
        columnDefs = [
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
        columnDefs = [
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
        columnDefs = [
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
        columnDefs = [
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
        columnDefs = [
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
        columnDefs = [];
    }

    return columnDefs;
  }


}
