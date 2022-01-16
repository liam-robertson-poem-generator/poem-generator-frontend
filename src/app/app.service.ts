import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

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
    return this.http.get("http://" + environment.env + "poem-generator/createDocument?" + generatorParameters, {"responseType": "blob"}).pipe(catchError(this.errorHandler));
  }

  getPoemNameList(): Observable<number[][]> {
    return this.http.get<number[][]>("http://" + environment.env + "poem-generator/listAllPoems")
  }
  
  errorHandler(error: HttpErrorResponse) {
    const myReader = new FileReader();
    myReader.onload = function(event){
      alert(myReader.result);
    };
    myReader.readAsText(error.error);

    return throwError(error);
  }

  errorHandler1(error: HttpErrorResponse) {
    return throwError(error.message || 'server Error');
  }
}
