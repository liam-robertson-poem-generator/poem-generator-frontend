import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;
  emailFormGroup = new FormGroup ({
    emailControl: new FormControl('', [Validators.required, Validators.email]),
    passwordControl: new FormControl(''),
  });

  constructor(
    public auth: AngularFireAuth,
    private router: Router) {}

  ngOnInit(): void {
  }

  login(): void {
    this.email = this.emailFormGroup.value.emailControl
		this.password = this.emailFormGroup.value.passwordControl

    this.auth.signInWithEmailAndPassword(this.email, this.password)
    .then(() => {
      this.router.navigate(["/generator"])
      })
    .catch(error => 
      console.log(error.code)
      )
  }
}
