import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";
import { GeneratorService } from "./generator.service";
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AlignmentType, Document, HeadingLevel, HorizontalPositionAlign, HorizontalPositionRelativeFrom, ImageRun, Packer, PageBreak, Paragraph, TextRun, TextWrappingSide, TextWrappingType, VerticalPositionRelativeFrom } from "docx";
const fs = require('fs');
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from "@angular/fire/compat/storage";

interface IPoem {
	poemCode: string;
	poemTitle: string;
	poemText: string;
	poemGlyph: string;
	hasTextVar: boolean;
}

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  providers: [ GeneratorService ],
  styleUrls: ['./generator.component.css']
})

export class GeneratorComponent implements OnInit {
  poemDataBool: boolean = true;
  formBool: boolean = false;
  loadingBool = false;
	successBool = false;

	optionsInt: number[][];
	options: string[];
	templatePath: string;
	filteredOptions: Observable<string[]>;
	poemList: number[][];
	poemListSorted: number[][];
	startingPoem: number[];
	poemListPath: string;
	numOfPoems: number;
	poemOrder: string;
	finalPoemList: string[];
	templateList: any[];
	outputPath: string;
	startingPoemRaw: string;
	loopCounter: number;
	
	axisDict = new Map();
	currentAxisNumber: number = 0
	nextAxisNumberDict = new Map();
	targetPoemDict = new Map();
	poemDataList: any;
	poemCodeListStr: string;
	poemCodeList: number[][];
	poemCodeListUnsorted: number[][];
	poemFormGroup: FormGroup;
	poemGlyph: any;
	poemXml: any;
	poemXmlUnparsed: any;
	poemText: any;
	poemTitle: any;
	url: any;
	ref: AngularFireStorageReference;
	task: AngularFireUploadTask;
	downloadURL: Observable<String>;

  
	constructor(
		private generatorService: GeneratorService,
		private afStorage: AngularFireStorage
		) {  
	}

  ngOnInit() {
	  
	let ref = this.afStorage.ref('/poems/1-1-1.xml');
	this.url = ref.getDownloadURL();
	this.url.subscribe((url: any)=>{this.imageUrl = url})
	console.log(this.imageUrl);
	
    this.generatorService.getPoemData().subscribe(poemCodeListRaw => {

		this.poemFormGroup = new FormGroup ({
			startingPoemControl: new FormControl(''),
			poemOrderControl: new FormControl(''),
			numOfPoemsControl: new FormControl('', [Validators.min(0), Validators.max(poemCodeListRaw.length)])
		});

		this.poemCodeListUnsorted = poemCodeListRaw.map((poemCodeStr: string) => 
			poemCodeStr.slice(0, -4).split("-").map(coord => parseInt(coord))
		)

		this.poemDataBool = false;
		this.formBool = true; 
				
		this.poemCodeList = this.sortByMultipleValues(this.poemCodeListUnsorted);	
		
		console.log(this.poemCodeList);


		this.optionsInt = this.poemCodeList;
		this.options = this.optionsInt.map(value => value.join("-").toString())
		this.filteredOptions = this.poemFormGroup.get('startingPoemControl')!.valueChanges
      .pipe(
        startWith(''),
        map(val => this._filter(val))
      );
	})
  }
	imageUrl(imageUrl: any) {
		throw new Error("Method not implemented.");
	}

	public async execute() {		
		this.formBool = false;
		this.loadingBool = true;
		await this.sleep(100);

		this.startingPoemRaw = this.poemFormGroup.value.startingPoemControl
		this.startingPoem = this.startingPoemRaw.split('-').map(coord => parseInt(coord))
		this.numOfPoems = this.poemFormGroup.value.numOfPoemsControl
		this.poemOrder = this.poemFormGroup.value.poemOrderControl

		console.log(this.numOfPoems);
		console.log(this.startingPoem);
		console.log(this.poemOrder);

		this.finalPoemList = this.iterateBySyllables(this.poemCodeList, this.startingPoem, this.numOfPoems, this.poemOrder)
		
		this.templateList = await this.createTemplateList(this.finalPoemList)
		await this.sleep(1000);
		console.log(this.templateList);
		console.log(this.templateList.length);
		
		this.writeDocument(this.templateList)
		await this.sleep(1500);

		this.loadingBool = false;
		this.successBool = true;
	}

	public iterateBySyllables(poemList: number[][], startingPoem: number[], numOfPoems: number, poemOrder: string) {
		let uniqueCoordList1: number[] = this.updateUniqueLists(poemList, startingPoem)[0]
		let uniqueCoordList2: number[] = this.updateUniqueLists(poemList, startingPoem)[1]
		let uniqueCoordList3: number[] = this.updateUniqueLists(poemList, startingPoem)[2]

		let outputList = []
		let successCounter: number = 0
		let xLoopCounter: number = 0
		let yLoopCounter: number = 0
		let zLoopCounter = 0
		let currentTargetPoem: number[] = startingPoem
		
		this.axisDict.set(0, uniqueCoordList1)		
		this.axisDict.set(1, uniqueCoordList2)
		this.axisDict.set(2, uniqueCoordList3)
		this.nextAxisNumberDict.set(0, 1)
		this.nextAxisNumberDict.set(1, 2)
		this.nextAxisNumberDict.set(2, 0)

		while (successCounter < numOfPoems) {
			// let axisDict = {0:uniqueCoordList1, 1:uniqueCoordList2, 2:uniqueCoordList3}
			let currentXUniqueList: number[] = this.axisDict.get(this.currentAxisNumber) as number[]
			let currentYUniqueList = this.axisDict.get(this.nextAxisNumberDict.get(this.currentAxisNumber) as number) as number[]
			let currentZUniqueList = this.axisDict.get(this.nextAxisNumberDict.get(this.nextAxisNumberDict.get(this.currentAxisNumber) as number) as number) as number[]
			let currentXCoord = currentXUniqueList[xLoopCounter]
			let currentYCoord = currentYUniqueList[yLoopCounter]
			let currentZCoord = currentZUniqueList[zLoopCounter]

			this.targetPoemDict.set(0, [currentXCoord, currentYCoord, currentZCoord])
			this.targetPoemDict.set(1, [currentZCoord, currentXCoord, currentYCoord])
			this.targetPoemDict.set(2, [currentYCoord, currentZCoord, currentXCoord])
			let currentTargetPoem = this.targetPoemDict.get(this.currentAxisNumber)
			
			if (!this.checkArrIn2dMatrix(outputList, currentTargetPoem) && this.checkArrIn2dMatrix(poemList, currentTargetPoem)) {
				console.log(successCounter);
				uniqueCoordList1 = this.updateUniqueLists(poemList, currentTargetPoem)[0]
				uniqueCoordList2 = this.updateUniqueLists(poemList, currentTargetPoem)[1]
				uniqueCoordList3 = this.updateUniqueLists(poemList, currentTargetPoem)[2]
				
				this.currentAxisNumber = this.nextAxisNumberDict.get(this.currentAxisNumber) as number
				outputList.push(currentTargetPoem.slice(0));
				poemList = this.removeItem(poemList, currentTargetPoem);

				zLoopCounter  = 0;
				yLoopCounter = 0;
				xLoopCounter = 0;
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
		if (poemOrder == "end") {
			outputList = outputList.reverse();
		}
		const finalOutputList = outputList.map(value => value.join("-").toString())		
		return finalOutputList
	}

	public updateUniqueLists(poemList: number[][], currentPoem: number[]) {
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

	public checkArrIn2dMatrix(matrix: number[][], testArr: number[]) {
		const matrixStr = matrix.map((poemCode) => String(poemCode));	
		return matrixStr.includes(testArr.toString())
	}

	public  removeItem(arr: number[][], item: number[]){
		return arr.filter(f => f.toString() !== item.toString())
	}

	public async createTemplateList(poemList: string[]):Promise<IPoem[]> {
		const outputList: IPoem[] = [];
		for (let index = 0; index < poemList.length; index++) {		

			let hasTextVar = true;
			const currentPoemName = poemList[index] + '.xml'
			const currentGlyphName = poemList[index] + '.jpg' 
			
			this.generatorService.getPoemXml(currentPoemName).subscribe(xml => {
				this.generatorService.getPoemGlyph(poemList[index]).subscribe(glyph => {			

					const parser = new DOMParser();
					this.poemXml = parser.parseFromString(xml, "text/xml");

					this.poemTitle = this.poemXml.getElementsByTagName("title")[0].textContent
					if (this.poemTitle == "") {
						this.poemTitle = "Untitled"
					}

					this.poemText = this.poemXml.getElementsByTagName("text")[0].textContent
					
					if (this.poemText === null) {
							hasTextVar = false;
					}
					outputList.push({
						poemCode: poemList[index],
						poemTitle: this.poemTitle,
						poemText: this.poemText,
						poemGlyph: glyph,
						hasTextVar: hasTextVar,
					})

				})

			})
		}					
		return outputList
	}

	public writeDocument(outputList: IPoem[]) {
		
		const docContentList = [];
		for (let index = 0; index < outputList.length; index++) { 
			const poemGlyph = outputList[index].poemGlyph	
			console.log(poemGlyph);
		
			const poemImage = new ImageRun({
				data: Uint8Array.from(atob(poemGlyph), c =>
				c.charCodeAt(0)
			  ),
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

			let currentTitle = 
				new Paragraph({
					children: [ 
						new TextRun({text: outputList[index].poemTitle, font: "Underwood Champion", size: 40}),
						new TextRun({text: " (" + outputList[index].poemCode + ")", font: "Underwood Champion", size: 30}),
					],
					pageBreakBefore: true,
					alignment: AlignmentType.CENTER,
				})

			let currentText = 
				new Paragraph({
					children: [ 
						new TextRun({text: outputList[index].poemText, font: "Underwood Champion", size: 30, break: 2}),
					],
				})

			let currentImage = new Paragraph({
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
			saveAs(blob, "example.docx");
		});

		// Packer.toBuffer(doc).then((buffer) => {
		// 	this.outputPath = "generated-poems_" + this.startingPoemRaw + "_" + this.numOfPoems + ".docx"
		// 	fs.writeFileSync("My document.docx", buffer) 
		// });	
	}

	public sortByMultipleValues(inputList: number[][]): number[][] {
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

	public sortedUniqueList(inputList: number[][], coordIndex: number) {
		const currentCoordSet = new Set(inputList.map(poemCode => poemCode[coordIndex]));  
		const currentCoordUnique = (Array.from(currentCoordSet));		
		const finalUniqueList = currentCoordUnique.sort(function(a, b){return a - b});
		return finalUniqueList
	}

	backToMain() {
		this.successBool = false;
		this.formBool = true;
	}

	sleep(ms: number) { 
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	_filter(val: string): string[] {
    return this.options.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);              
  }
}
