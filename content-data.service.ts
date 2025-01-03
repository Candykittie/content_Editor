import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentDataService {
  contentDataSource: any;
  private apiUrl = 'http://localhost:26255/api/content';
  // baseUrl = 'http://localhost:26255/api';
  constructor(private http: HttpClient) {}


  getContentData(Data?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getContentData`);
  }

  updateAllContentData(contentData: any): Observable<any> {
  const params = new HttpParams()
    .set('rowIndex', contentData.rowIndex) 
    .set('colIndex', contentData.colIndex) 
    .set('content_ID', contentData.content_ID ||'null') 
    .set('ordering', contentData.ordering ||'null') // Ordering
    .set('content', contentData.content ||'null') 
    .set('content_Type', contentData.content_Type|| 'null') 
    .set('imageURL', contentData.imageURL|| 'null') 
    .set('image_Text', contentData.image_Text || 'null')  

  return this.http.get<any>(`${this.apiUrl}/updateContentData`, { params });
}

  getcontentData(): any { 
    return this.contentDataSource.getValue();
  }
  sendCellClickData(data: { rowIndex: number; column: string }): Observable<any> {
    return this.http.get(`${this.apiUrl}/cell-click`);
  }
  // sendContentData (data : any) : void {
  //   this.contentDataSource.next(data);
  // }
  
}
