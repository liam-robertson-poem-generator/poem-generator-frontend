import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/config.service';

@Injectable()
export class GeneratorService {

  constructor(public http: HttpClient, public configService: ConfigService) {}

  private generatorHeaders = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    }),
  };

  getPoemData(): Observable<any> {
    return this.http.get("http://localhost:4200/api" + "/poemGenerator/getAllPoemCodes", this.generatorHeaders);
  }

  getPoemXml(poemName: string): Observable<any> {
    return this.http.get("http://localhost:4200/api/poems/" + poemName, {responseType: 'text'});
  }

  getPoemGlyph(glyphName: string): Observable<any> {
    return this.http.get("http://localhost:4200/api/poemGenerator/getGlyph2?poemCode=" + glyphName, {responseType: 'text'});
  }

}