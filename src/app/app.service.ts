import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { getDownloadURL, getStorage, listAll, ref, StorageReference } from 'firebase/storage';
import { resolve } from 'dns';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  storage = getStorage();
  listRef = ref(this.storage, 'poem-xml');

  constructor(public http: HttpClient) {}

  private generatorHeaders = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    }),
  };

  async getPoemNameList(): Promise<number[][]> {
  const poemNameList: number[][] = []
  await listAll(this.listRef)
  .then((res) => {
    res.items.forEach((itemRef) => {
      const poemNameMatrix: number[] = itemRef.name.slice(0, -4).split("-").map(coord => parseInt(coord))
      poemNameList.push(poemNameMatrix);
    });
  })
  return poemNameList;
}

  getPoemXml(poemUrl: string): Observable<any> {
    return this.http.get(poemUrl, {responseType: 'text'});
  }

  getPoemGlyph(glyphUrl: string): Observable<any> {
    return this.http.get(glyphUrl, {responseType: "arraybuffer"});
  }
}
