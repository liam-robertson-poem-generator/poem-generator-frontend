import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";
import { AppService } from "../app.service";
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { AlignmentType, Document, HorizontalPositionAlign, ImageRun, Packer, Paragraph, TextRun, VerticalPositionRelativeFrom } from "docx";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { saveAs } from 'file-saver';
import { IPoem } from "./models/poem";
import { Router } from "@angular/router";

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  providers: [ AppService ],
  styleUrls: ['./generator.component.css']
})

export class GeneratorComponent implements OnInit {

	// To Do List:
	// - Router guards
	// - Fix algorithm
	// - Default page instead of blank login
	// - Routing Loading pages
	// - Make sure the line breaks within poems are conserved (in conversion from xml to json).
	// - Assuming that each cell retains its file name code in the directory, delete “Untitled” and the bracketed codes from the top of each untitled text for the print copy. I think only 5-10% of the texts have actual titles. Ideally, keep the definite titles and delete the codes beside them. If that’s too awkward, 2nd-best option would be just to leave the bracketed codes after the actual titles.
	// - Change from Underwood to Garamond font.
	
	poemDataBool: boolean = true;
	formBool: boolean = false;

	dropdownOptions: string[];
	filteredDropdownOptions: Observable<string[]>;

	startingPoem: number[];
	numOfPoems: number;
	poemOrder: string;

	poemFormGroup: FormGroup;
	poemCodeList: number[][];

	constructor(
		private appService: AppService,
		private router: Router
		) { }

  async ngOnInit() {
		const poemCodeListUnsorted: number[][] = await this.appService.getPoemNameList();
		
		this.poemFormGroup = new FormGroup ({
			startingPoemControl: new FormControl(''),
			poemOrderControl: new FormControl(''),
			numOfPoemsControl: new FormControl('', [Validators.min(0), Validators.max(poemCodeListUnsorted.length)])
		});

		this.poemDataBool = false;
		this.formBool = true; 
				
		this.poemCodeList = this.sortByMultipleValues(poemCodeListUnsorted);	

		const dropdownOptions: string[] = this.poemCodeList.map(value => value.join("-").toString())
		this.filteredDropdownOptions = this.poemFormGroup.get('startingPoemControl')!.valueChanges
		.pipe(startWith(''), map(value => this._filter(value, dropdownOptions)));
  }

	async execute() {		
		this.router.navigate(["/loading"])

		const startingPoemRaw: string = this.poemFormGroup.value.startingPoemControl
		this.startingPoem = startingPoemRaw.split('-').map(coord => parseInt(coord))
		this.numOfPoems = this.poemFormGroup.value.numOfPoemsControl
		this.poemOrder = this.poemFormGroup.value.poemOrderControl

		console.log(this.startingPoem);
		console.log(this.numOfPoems);
		console.log(this.poemOrder);

		const finalPoemList = this.iterateBySyllables(this.poemCodeList, this.startingPoem, this.numOfPoems, this.poemOrder)
		
		const templateList = await this.createTemplateList(finalPoemList)
		this.writeDocument(templateList)

		this.router.navigate(["/success"])
	}

	iterateBySyllables(poemList: number[][], startingPoem: number[], numOfPoems: number, poemOrder: string) {
		let [uniqueCoordList1, uniqueCoordList2, uniqueCoordList3]: number[][] = this.updateUniqueLists(poemList, startingPoem);

		const axisDict: Map<number, number[]> = new Map([[0, uniqueCoordList1], [1, uniqueCoordList2], [2, uniqueCoordList3]]);
		const nextAxisNumberDict: Map<number, number> = new Map([[0, 1], [1, 2], [2, 0]]);
		const outputList: number[][] = [];
		let successCounter: number = 0
		let [xLoopCounter, yLoopCounter, zLoopCounter]: number[] = [0, 0, 0];
		let currentAxisNumber: number = 0;

		let currentXUniqueList: number[]
		let currentYUniqueList: number[]
		let currentZUniqueList: number[]
		let currentXCoord: number
		let currentYCoord: number
		let currentZCoord: number
		let currentTargetPoem: number[]

		while (successCounter < numOfPoems) {
			currentXUniqueList = axisDict.get(currentAxisNumber) as number[]
			currentYUniqueList = axisDict.get(nextAxisNumberDict.get(currentAxisNumber) as number) as number[]
			currentZUniqueList = axisDict.get(nextAxisNumberDict.get(nextAxisNumberDict.get(currentAxisNumber) as number) as number) as number[]
			currentXCoord= currentXUniqueList[xLoopCounter]
			currentYCoord = currentYUniqueList[yLoopCounter]
			currentZCoord = currentZUniqueList[zLoopCounter]

			const targetPoemDict: Map<number, number[]> = new Map([[0, [currentXCoord, currentYCoord, currentZCoord]], [1, [currentZCoord, currentXCoord, currentYCoord]], [2, [currentYCoord, currentZCoord, currentXCoord]]]);
			currentTargetPoem = targetPoemDict.get(currentAxisNumber) as number[]
			
			if (!this.checkArrIn2dMatrix(outputList, currentTargetPoem) && this.checkArrIn2dMatrix(poemList, currentTargetPoem)) {
				[uniqueCoordList1, uniqueCoordList2, uniqueCoordList3]= this.updateUniqueLists(poemList, currentTargetPoem);
				
				currentAxisNumber = nextAxisNumberDict.get(currentAxisNumber) as number
				outputList.push(currentTargetPoem.slice(0));
				poemList = this.removeItem(poemList, currentTargetPoem);

				[xLoopCounter, yLoopCounter, zLoopCounter] = [0, 0, 0];
				successCounter++
			} else if (currentXCoord == currentXUniqueList[currentXUniqueList.length - 1]) {
				if (currentYCoord == currentYUniqueList[currentYUniqueList.length - 1]) {
					if (currentZCoord == currentZUniqueList[currentZUniqueList.length - 1]) {
						zLoopCounter  = 0;
						yLoopCounter = 0;
						xLoopCounter = 0;
					}
					zLoopCounter += 1;
					yLoopCounter = 0;
					xLoopCounter = 0;
				}
				yLoopCounter += 1;
				xLoopCounter = 0;
			} else {
				xLoopCounter += 1;
			}
		}

		let outputListOrdered;
		if (poemOrder == "end") {
			outputListOrdered = outputList.reverse();
		} else {
			outputListOrdered = outputList;
		}
		const finalOutputList = outputListOrdered.map(value => value.join("-").toString())		
		return finalOutputList
	}

	updateUniqueLists(poemList: number[][], currentPoem: number[]) {
		const uniqueCoordList1Raw: number[] = this.sortedUniqueList(poemList, 0)
		const uniqueCoordList2Raw: number[] = this.sortedUniqueList(poemList, 1)
		const uniqueCoordList3Raw: number[] = this.sortedUniqueList(poemList, 2)

		const xIndex = uniqueCoordList1Raw.indexOf(currentPoem[0])
		const yIndex = uniqueCoordList2Raw.indexOf(currentPoem[1]) 
		const zIndex = uniqueCoordList3Raw.indexOf(currentPoem[2])

		const uniqueCoordList1: number[] = uniqueCoordList1Raw.slice(xIndex).concat(uniqueCoordList1Raw.slice(0, xIndex));
		const uniqueCoordList2: number[] = uniqueCoordList2Raw.slice(yIndex).concat(uniqueCoordList2Raw.slice(0, yIndex));
		const uniqueCoordList3: number[] = uniqueCoordList3Raw.slice(zIndex).concat(uniqueCoordList3Raw.slice(0, zIndex));
		return [uniqueCoordList1, uniqueCoordList2, uniqueCoordList3]
	}

	checkArrIn2dMatrix(matrix: number[][], testArr: number[]) {
		const matrixStr = matrix.map((poemCode) => String(poemCode));	
		return matrixStr.includes(testArr.toString())
	}

	removeItem(arr: number[][], item: number[]){
		return arr.filter(f => f.toString() !== item.toString())
	}

	async createTemplateList(poemList: string[]) {
		const outputList: IPoem[] = [];
		for (let index = 0; index < poemList.length; index++) {		
			let hasTextVar = true;
			const currentPoemName = poemList[index] 

			const storage = getStorage();
			const xmlRef = ref(storage, 'poem-xml/' + currentPoemName + '.xml');

			let currentPoemXmlUrl: string = ""
			let currentGlyphUrl: string = ""
			await getDownloadURL(xmlRef)
				.then((xmlUrl) => {
					currentPoemXmlUrl = xmlUrl
				})
				.catch((error) => {
					error.code
			});

			const glyphRef = ref(storage, 'glyphs/' + currentPoemName + '.jpg');
			await getDownloadURL(glyphRef)
				.then((glyphUrl) => {
					currentGlyphUrl = glyphUrl
				})
				.catch((error) => {
					error.code
			});
			this.appService.getPoemXml(currentPoemXmlUrl).subscribe(currentXml => {
				this.appService.getPoemGlyph(currentGlyphUrl).subscribe(currentGlyph => {
					let encodedData = 'data:image/jpeg;base64,' + Buffer.from(currentGlyph).toString('base64')
					const parser = new DOMParser();
					const poemXml = parser.parseFromString(currentXml, "text/xml");

					const poemText = poemXml.getElementsByTagName("text")[0].textContent
					let poemTitle = poemXml.getElementsByTagName("title")[0].textContent
					if (poemTitle == "") {
						poemTitle = "Untitled"
					}

					if (poemText === null) {
							hasTextVar = false;
					}
					outputList.push({
						poemCode: poemList[index],
						poemTitle: poemTitle as string,
						poemText: poemText as string,
						poemGlyph: encodedData,
						hasTextVar: hasTextVar,
					})
				})
			})
		}					
		return outputList
	}

	writeDocument(outputList: IPoem[]) {
		const docContentList = [];
		for (let index = 0; index < outputList.length; index++) { 
			const poemGlyph = outputList[index].poemGlyph	
		
			const poemImage = new ImageRun({
				data: poemGlyph,
				transformation: {
					width: 215,
					height: 215,
				},
				floating: {
					horizontalPosition: {
						align: HorizontalPositionAlign.CENTER,
						offset: 0,
					},
					verticalPosition: {
						relative: VerticalPositionRelativeFrom.PARAGRAPH,
						offset: 2014400,
					},
				},
			});	

			const currentTitle = 
				new Paragraph({
					children: [ 
						new TextRun({text: outputList[index].poemTitle, font: "Underwood Champion", size: 40}),
						new TextRun({text: " (" + outputList[index].poemCode + ")", font: "Underwood Champion", size: 30}),
					],
					pageBreakBefore: true,
					alignment: AlignmentType.CENTER,
				})

			const currentText = 
				new Paragraph({
					children: [ 
						new TextRun({text: outputList[index].poemText, font: "Underwood Champion", size: 30, break: 2}),
					],
				})

			const currentImage = new Paragraph({
				children: [
					poemImage
				]})
				
			docContentList.push(currentTitle) 
			docContentList.push(currentText) 
			docContentList.push(currentImage) 
		}
		
		const doc = new Document({
			sections: [{
				properties: {},
				children: docContentList,
			}]
		});

		Packer.toBlob(doc).then((blob) => {
			saveAs(blob, "syllabary-poems_" + this.startingPoem.join("-") + "_" + this.numOfPoems + ".docx");
		});
	}

	sortByMultipleValues(inputList: number[][]): number[][] {
		const outputListRaw: number[][] = [];
		const tempList = [];
		const uniqueCoordList1: number[] = this.sortedUniqueList(inputList, 0)
		const uniqueCoordList2: number[] = this.sortedUniqueList(inputList, 1)
		const uniqueCoordList3: number[] = this.sortedUniqueList(inputList, 2)

		for (let xj=0; xj < uniqueCoordList1.length; xj++) {
				for (let yj=0; yj < uniqueCoordList2.length; yj++) {
						for (let zj=0; zj < uniqueCoordList3.length; zj++) {
								for (let i=0; i < inputList.length; i++) {
										if (inputList[i][0] == uniqueCoordList1[xj] && inputList[i][1] == uniqueCoordList2[yj] && inputList[i][2] == uniqueCoordList3[zj]) {
												tempList.push(inputList[i]);
										}
								}
						}
				}
		}
		const outputList = outputListRaw.concat(tempList);
	return outputList
	}

	sortedUniqueList(inputList: number[][], coordIndex: number) {
		const currentCoordSet = new Set(inputList.map(poemCode => poemCode[coordIndex]));  
		const currentCoordUnique = (Array.from(currentCoordSet));		
		const finalUniqueList = currentCoordUnique.sort(function(a, b){return a - b});
		return finalUniqueList
	}

	sleep(ms: number) { 
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	_filter(val: string, dropdownOptions: any[]): string[] {
    return dropdownOptions.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);              
  }
}

