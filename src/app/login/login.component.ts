import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string;
  password: string;

  constructor(
    public auth: AngularFireAuth,
    private router: Router) { }

  ngOnInit(): void {
  }

  login(): void {
    this.auth.signInWithEmailAndPassword(this.email, this.password)
    .then(() => {
      this.router.navigate(["/generator"])
      })
    .catch(error => 
      console.log(error.code)
      )
  }
}
