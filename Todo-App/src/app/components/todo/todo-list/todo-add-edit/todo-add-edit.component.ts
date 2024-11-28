import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription, catchError, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-todo-add-edit',
  templateUrl: './todo-add-edit.component.html',
  styleUrls: ['./todo-add-edit.component.css'],
})
export class TodoAddEditComponent implements OnDestroy {
  @Input() editMode: boolean;
  @Input() editId: number;
  @Input() editTitle: string = '';
  @Input() editTask: string = '';
  @Output() taskAdded = new EventEmitter<void>();
  @Output() taskEdited = new EventEmitter<void>();

  form: FormGroup;
  errorMsg: string = '';
  successMsg: string = '';
  successMsgEdit: string = '';

  // Used to store subscription of observables
  addTaskSubscription: Subscription;
  editTaskSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackbar: MatSnackBar
  ) {
    this.form = fb.group({
      title: ['', [Validators.required]],
      task: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      const username = localStorage.getItem('username');
      if (!username) {
        console.error('Username not found in local storage');
        return;
      }

      formData.username = username;

      this.addTaskSubscription = this.http
        .post<any>('http://localhost:3000/todo/addTask', formData)
        .subscribe({
          next: (response) => {
            if (response) {
              // Reset the form
              this.form.reset();

              // Resetting the state of the form
              Object.keys(this.form.controls).forEach((key) => {
                this.form.get(key)?.setErrors(null); // Clear errors for each form control
              });
              this.errorMsg = ''; // Clear any remaining error message
              this.successMsg = 'Task Added Successfully!';
              // Task emitted so that fetchTodoTasks is called to add tasks without refreshing the page
              this.taskAdded.emit();
              setTimeout(() => {
                this.successMsg = '';
              }, 1000);
            }
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 401) {
              // Session id not present in request
              console.log('Session Expired!');
              this.snackbar.open(
                'Session expired. Please log in again.',
                'Close'
              );
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 1000);
            } else {
              // server not running
              this.form.reset();
              Object.keys(this.form.controls).forEach((key) => {
                this.form.get(key)?.setErrors(null); // Clear errors for each form control
              });
              console.error('Error occurred while deleting task:', error);
              this.snackbar.open('Error occurred while adding task', 'Close');
            }
          },
        });
    }
  }

  onSubmitEdit() {
    if (this.form.valid) {
      const formData = this.form.value;
      formData.id = this.editId;

      this.editTaskSubscription = this.http
        .put<any>(`http://localhost:3000/todo/editTask`, formData)
        .subscribe({
          next: (response) => {
            if (response) {
              // Reset the form and clear error messages
              this.form.reset();
              Object.keys(this.form.controls).forEach((key) => {
                this.form.get(key)?.setErrors(null); // Clear errors for each form control
              });
              this.errorMsg = ''; // Clear any remaining error message
              // Task emitted so that fetchTodoTasks is called to add tasks without refreshing the page
              this.successMsgEdit = 'Task Edited Successfully!';

              setTimeout(() => {
                this.successMsgEdit = '';
                this.editMode = false; // Close the edit mode after successful edit
                this.taskEdited.emit();
              }, 1000);
            }
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 401) {
              // session id not present in request
              console.log('Session Expired!');
              this.snackbar.open(
                'Session expired. Please log in again.',
                'Close'
              );
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 1000);
            } else {
              // server not running
              this.form.reset();
              Object.keys(this.form.controls).forEach((key) => {
                this.form.get(key)?.setErrors(null); // Clear errors for each form control
              });
              console.error('Error occurred while deleting task:', error);
              this.snackbar.open('Error occurred while editing task', 'Close');
            }
          },
        });
    }
  }

  editCancel() {
    this.editMode = false;
    this.form.reset();
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.setErrors(null); // Clear errors for each form control
    });
    this.taskEdited.emit();
  }

  ngOnDestroy(): void {
    if (this.addTaskSubscription) {
      this.addTaskSubscription.unsubscribe();
    }
    if (this.editTaskSubscription) {
      this.editTaskSubscription.unsubscribe();
    }
  }
}
