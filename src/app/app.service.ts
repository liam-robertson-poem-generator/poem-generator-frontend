import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';

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

  createWordDoc(generatorParameters: String): Observable<Blob> {
    return this.http.get("http://" + environment.env + "poem-generator/createDocument?" + generatorParameters, {responseType: "blob"})
  }

  getPoemNameList(): Observable<number[][]> {
    return this.http.get<number[][]>("http://" + environment.env + "poem-generator/listAllPoems")
  }

}
