import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AsyncValidatorFn, ValidationErrors, AbstractControl } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { MyValidators } from './validators/my-validators';
import { MyValidatorsAsync } from './validators/my-validators-async';



@Component({

  selector: 'app-form-reactive',

  template: `

  <div class="mt-5">
  <div class="form-group">
    <label>
        Single FormControl:
    </label>
    <input type="text" [formControl]="single">
    <app-form-control-errors [fControl]="single"></app-form-control-errors>
  </div>
  <button  class="btn btn-secondary" (click)="showSingle()" >mostra valore</button>



  <h3>FromGroup</h3>
  <div class="p-4 border">

  <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">

    <div class="form-group">
        <label>
          First Name:
        </label>
        <input type="text" formControlName="firstName">
        <!--
        <div *ngIf="profileForm.controls['firstName'].errors?.required" class="text-danger">
          Il campo è obbligatorio
        </div>
        <div *ngIf="profileForm.controls['firstName'].errors?.maxlength" class="text-danger">
          Il campo è troppo lungo
        </div>
        -->
        <div *ngFor="let el of profileForm.controls['firstName'].errors | keyvalue"  class="text-danger">
            Errore: {{el.key}} {{el.value | json}}
        </div>

    </div>

    <div class="form-group">
      <label>
        Last Name:
      </label>
      <input type="text" formControlName="lastName">
      <app-form-control-errors [fControl]="profileForm.controls['lastName']" [errMsgs]="{pattern:'è sbagliato'}"></app-form-control-errors>
    </div>

    <div class="form-group">
      <label>
        Email:
      </label>
      <input type="email" formControlName="email">
      <app-form-control-errors [fControl]="profileForm.controls['email']"></app-form-control-errors>
    </div>


    <div formGroupName="address">

              <h3>Address <small>(nested FormGroup)</small></h3>

              <div class="form-group">
                <label>
                  Street:
                </label>
                <input type="text" formControlName="street">
                <app-form-control-errors [fControl]="$any(profileForm.controls['address']).controls['street']"></app-form-control-errors>
              </div>

              <div class="form-group">
                <label>
                  City:
                </label>
                <input type="text" formControlName="city">
                <app-form-control-errors [fControl]="fcMap.address.city"></app-form-control-errors>
              </div>

              <div class="form-group">
                <label>
                  State:
                </label>
                <input type="text" formControlName="state">
                <app-form-control-errors [fControl]="fcMap.address.state"></app-form-control-errors>
              </div>

              <div class="form-group">
                <label>
                  Zip Code:
                </label>
                <input type="text" formControlName="zip">
              </div>
    </div>

    <button type="submit" class="btn btn-secondary" [disabled]="!profileForm.valid">submit</button>
</form>
</div>

</div>
  `,
  styles: [`
    input.ng-invalid{
       border: 1px solid red;
    }
  `]
})
export class FormReactiveComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  /*
    single = new FormControl('',
        [Validators.required, Validators.pattern(/^abc.*$/)],
        MyValidatorsAsync.contains('super')
    );
  */

  single = new FormControl('', {
    validators: [
      Validators.required,
      MyValidators.contains('abc')
    ],
    asyncValidators: [
      MyValidatorsAsync.contains('super')
    ]
    // , updateOn: 'change' || 'blur' || 'submit'
  });


  // standard syntax
  /*
    profileForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl(''),
      address: new FormGroup({
        street: new FormControl('',Validators.required),
        city: new FormControl(''),
        state: new FormControl(''),
        zip: new FormControl('')
      })
    });
*/


  // builder syntax
  profileForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(10)]],
    lastName: ['', Validators.pattern(/^[A-Z][a-zA-Z ]+[a-zA-Z]$/)], // espressione regolare https://regex101.com/

    email: ['', {
      validators: [
        Validators.required,
        Validators.email,


        // custom validator as arrow function
        (c: AbstractControl) => {


          console.log('c.value: ', c.value);

          if (c.value.length % 2 === 1) {
            return null; // ok
          } else {
            return { numeroCaratteriPari: { aaa: '', bbb: 123 } }; // single error
          }

          // return { condition_abc: true }; // single error
          // return { condition_abc: { aaa:'', bbb:123 } }; // single error with more infomation
          // return { condition_abc: true, condition_efg: true }; // multiple error

          // return; // or null | undefined = no error
          // no return = no error

        }
      ],

      // updateOn: 'change' || 'blur' || 'submit'
    }
    ],
    address: this.fb.group({
      street: ['', [Validators.required, Validators.pattern(/^abc.*/)]],
      city: ['', Validators.required],
      state: [''],
      zip: ['']
    }),
  });





  fcMap: { [key: string]: any };





  ngOnInit() {

    this.fcMap = this.mapFormControls(this.profileForm, 1);
    console.log('this.fcm: ', this.fcMap);


  }

  /**
   * Map form controls into simple javascript object
   * @param fg the form group
   * @param depth the depth of recursion, if === -1 then make a flat map (require unique identifiers)
   * @param map the object map, optional
   */
  mapFormControls(fg: FormGroup, depth: number = 0, map: { [key: string]: any } = {}): { [key: string]: any } {
    if (fg.controls) {
      for (const fcn in fg.controls) {
        if (fg.controls[fcn] instanceof FormGroup) {
          if (depth > 0) {
            map[fcn] = this.mapFormControls(fg.controls[fcn] as FormGroup, depth - 1, map[fcn]);
          } else if (depth === -1) {
            this.mapFormControls(fg.controls[fcn] as FormGroup, depth, map);
          }
          return map;
        } else {
          if (map[fcn]) {
            throw new Error('duplicate identifier: ' + fcn);
          }
          map[fcn] = fg.controls[fcn];
        }
      }
    }
    return map;
  }




  showSingle() {
    console.log('this.single.value: ', this.single.value);
    console.log('this.single.errors: ', this.single.errors);
  }
  onSubmit() {
    console.log('this.profileForm.value: ', this.profileForm.value);
    console.log('this.profileForm.errors: ', this.profileForm.errors);
  }

}


/*

Validatori predefiniti:

class Validators {

  static min(min: number): ValidatorFn
  static max(max: number): ValidatorFn
  static required(control: AbstractControl): ValidationErrors | null
  static requiredTrue(control: AbstractControl): ValidationErrors | null
  static email(control: AbstractControl): ValidationErrors | null
  static minLength(minLength: number): ValidatorFn
  static maxLength(maxLength: number): ValidatorFn
  static pattern(pattern: string | RegExp): ValidatorFn
  static nullValidator(control: AbstractControl): ValidationErrors | null


  static compose(validators: ValidatorFn[]): ValidatorFn | null
  static composeAsync(validators: AsyncValidatorFn[]): AsyncValidatorFn | null
}

*/
