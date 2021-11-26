import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { getDownloadURL, getStorage, listAll, ref, StorageReference } from 'firebase/storage';
import { resolve } from 'dns';

@Injectable()
export class GeneratorService {
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



// async getPoemXmlUrl(poemCode: string) {
//   const xmlRef = ref(this.storage, 'poem-xml/' + poemCode + '.xml');
//   return await getDownloadURL(xmlRef)
//   .then((xmlUrl) => {
//     console.log(xmlUrl);
//   })
//   .catch((error) => {
//     error.code
//   });
// }

// async getPoemGlyphUrl(poemCode: string) {
//   const glyphRef = ref(this.storage, 'glyphs/' + poemCode + '.svg');
//   let glyphUrl = '';
//   await getDownloadURL(glyphRef)
//   .then((url) => {
//     console.log(url);
//     glyphUrl = url
//   })
//   .catch((error: any) => {
//     error.code
//   });
//   return glyphUrl
// }









  // getPoemData(): Observable<any> {
  //   return this.http.get("http://localhost:4200/api" + "/poemGenerator/getAllPoemCodes", this.generatorHeaders);
  // }

  // getPoemXml(poemName: string): Observable<any> {
  //   return this.http.get("http://localhost:4200/api/poems/" + poemName, {responseType: 'text'});
  // }

  // getPoemGlyph(glyphName: string): Observable<any> {
  //   return this.http.get("http://localhost:4200/api/poemGenerator/getGlyph2?poemCode=" + glyphName, {responseType: 'text'});
  // }

  
  
  // getDownloadURL(starsRef)
	// .then((url) => {
	// 	console.log(url);
	// })
	// .catch((error) => {
	// 	switch (error.code) {
	// 	case 'storage/object-not-found':
	// 		break;
	// 	case 'storage/unauthorized':
	// 		break;
	// 	case 'storage/canceled':
	// 		break;
	// 	case 'storage/unknown':
	// 		break;
	// 	}
	// });
