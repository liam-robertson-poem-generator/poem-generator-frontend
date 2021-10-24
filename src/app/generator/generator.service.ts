import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class GeneratorService {

  constructor(private http: HttpClient) { }

  poemDataUrl = '/syllabary-poems';

  getPoemData(): any {
    return this.http.get<Generator>(this.poemDataUrl);
  }
}
