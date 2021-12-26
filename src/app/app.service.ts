import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(public http: HttpClient) {}

  private generatorHeaders = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    })
  };

  getPoemNameList(): Observable<number[][]> {
    return this.http.get<number[][]>("http://localhost:4200/api/poem-generator/listAllPoems")
  }

  sendGeneratorParameters(): Observable<number[][]> {
    return this.http.get<number[][]>("http://localhost:4200/api/poem-generator/listAllPoems")
  }

  getWordDoc(): Observable<Blob> {
    return this.http.get("http://localhost:4200/api/poem-generator/outputDocument/output.docx", {responseType: "blob"});
  }

}
