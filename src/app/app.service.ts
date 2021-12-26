import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { IGeneratorParameters } from './models/generatorParameters';

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

  createWordDoc(generatorParameters: IGeneratorParameters) {
    return this.http.post("http://localhost:4200/api/poem-generator/createDocument", generatorParameters, {responseType: 'text'})
  }

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
