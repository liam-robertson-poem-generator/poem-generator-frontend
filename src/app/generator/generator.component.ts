import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";
import { AppService } from "../app.service";
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router } from "@angular/router";
import * as saveAs from "file-saver";

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  providers: [ AppService ],
  styleUrls: ['./generator.component.css']
})

export class GeneratorComponent implements OnInit {
	loadingBool: boolean = true;
	formBool: boolean = false;
	poemCodeList: number[][] = [];
	filteredDropdownOptions: Observable<string[]>;
	startingPoem: string;
	numOfPoems: number;
	poemOrder: string;
	maxNumPoems: number = 0;
	poemFormGroup: FormGroup;

	constructor(
		private appService: AppService,
		private router: Router
		) { }

  async ngOnInit() {
		this.appService.getPoemNameList().subscribe(poemCodeList => {
			this.poemFormGroup = new FormGroup ({
				startingPoemControl: new FormControl(''),
				poemOrderControl: new FormControl(''),
				numOfPoemsControl: new FormControl('', [Validators.min(0), Validators.max(poemCodeList.length)])
			});

			this.poemCodeList = poemCodeList
			this.loadingBool = false;
			this.formBool = true; 

			const dropdownOptions: string[] = this.poemCodeList.map(value => value.join("-").toString())
			this.filteredDropdownOptions = this.poemFormGroup.get('startingPoemControl')!.valueChanges.pipe(startWith(''), map(value => this._filter(value, dropdownOptions)));			
		});

  }

	async execute() {		
		this.router.navigate(["/loading"])

		this.startingPoem= this.poemFormGroup.value.startingPoemControl
		this.numOfPoems = this.poemFormGroup.value.numOfPoemsControl
		this.poemOrder = this.poemFormGroup.value.poemOrderControl

		this.router.navigate(["/success"])
		this.downloadWordDoc("test.docx")
	}

	downloadWordDoc(filename: string) {
		this.appService.getWordDoc().subscribe(doc => {
			saveAs(doc, "hello world.docx");
		})	
	}

	sleep(ms: number) { 
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	_filter(val: string, dropdownOptions: any[]): string[] {
    return dropdownOptions.filter(option =>
      option.toLowerCase().indexOf(val.toLowerCase()) === 0);              
  }
}

