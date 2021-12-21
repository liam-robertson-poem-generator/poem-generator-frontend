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
    return this.http.get<string[]>("http://localhost:4200/api/poem-generator/listAllPoems")
    .pipe(
    map((poemNameList: string[]) => 
      poemNameList.map((poemName: string) => 
        <number[]>poemName.slice(0,-4).split("-").map((coord: string) => 
          <number>parseInt(coord)))
      )
    )
  }

  getPoemXml(poemName: string): Observable<string> {
    return this.http.get("http://localhost:4200/api/poems/" + poemName + ".xml", {responseType: 'text'});
  }

  getPoemGlyph(poemName: string): Observable<ArrayBuffer> {
    return this.http.get("http://localhost:4200/api/glyphs/" + poemName + ".jpg", {responseType: "arraybuffer"});
  }
}
