import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Todo } from '../../../shared/todo';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription, catchError, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit, OnDestroy {
  @ViewChild('navbar') navbar: ElementRef;

  todo: Todo[];
  completedTodo: Todo[];
  pendingTodo: Todo[];

  displayedColumns: string[] = ['title', 'task', 'status', 'edit', 'delete'];

  // Properties which we have to send to the child component
  editMode: boolean = false;
  editId: number;
  editTitle: string = '';
  editTask: string = '';

  successMsgEdit: string = '';

  // Used to store subscription of observables
  getTaskSubscription: Subscription;
  deleteTaskSubscription: Subscription;
  stateChangeSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchTodoTasks();
  }

  fetchTodoTasks(): void {
    const username = localStorage.getItem('username');
    if (!username) {
      console.error('Username not found in local storage');
      return;
    }

    this.getTaskSubscription = this.http
      .get<any[]>(`http://localhost:3000/todo/getTodoTasks/${username}`)
      .subscribe({
        next: (response: Todo[]) => {
          if (response) {
            this.todo = response;
            // Assigns value to completedTodo and pendingTodo
            this.filterTodos();

            // Show a snackbar when todo is empty
            if (this.todo.length === 0) {
              this.snackBar.open(
                'No tasks found. Please add some tasks.',
                'Close'
              );
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.log('Error occurred while displaying all tasks', error);
          this.snackBar.open(
            'Error occurred while displaying all tasks',
            'Close'
          );
        },
      });

    // After editing a task, we have to make the editMode = false, beacause if it remains true, Then the binding wont work
    if (this.editMode === true) this.editMode = false;
  }

  filterTodos() {
    this.completedTodo = this.todo.filter((task) => task.status == true);
    this.pendingTodo = this.todo.filter((task) => task.status == false);
  }

  deleteTodo(taskId: number): void {
    this.deleteTaskSubscription = this.http
      .delete(`http://localhost:3000/todo/deleteTask/${taskId}`)
      .subscribe({
        next: (response) => {
          if (response) {
            // To show instantaneous changes in the UI when task is deleted
            this.fetchTodoTasks();
            console.log('Task deleted successfully');
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Session id not present in request
            console.log('Session Expired!');
            this.snackBar.open(
              'Session expired. Please log in again.',
              'Close'
            );
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1000);
          } else {
            // Server not running
            console.error('Error occurred while deleting task:', error);
            this.snackBar.open('Error occurred while deleting task', 'Close');
          }
        },
      });
  }

  editTodo(id: number, title: string, task: string) {
    this.editId = id;
    this.editTitle = title;
    this.editTask = task;
    this.editMode = true;
    this.scrollToEditForm();
  }

  scrollToEditForm() {
    // Adjust the viewport to bring the navbar component in view
    this.navbar.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  onStatusChange(checked: boolean, id: number) {
    const status = {
      status: checked,
      id: id,
    };
    this.stateChangeSubscription = this.http
      .put<any>('http://localhost:3000/todo/updateTaskStatus', status)
      .subscribe({
        next: (response) => {
          if (response) {
            console.log('Task status updated successfully');
            this.fetchTodoTasks();
          }
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Session id not present in request
            this.snackBar.open(
              'Session expired. Please log in again.',
              'Close'
            );
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1000);
          } else {
            // server not running
            console.error('Error updating task status:', error);
            this.snackBar.open(
              'Error occurred while updating task status',
              'Close'
            );
          }
        },
      });
  }

  ngOnDestroy(): void {
    if (this.getTaskSubscription) {
      this.getTaskSubscription.unsubscribe();
    }
    if (this.deleteTaskSubscription) {
      this.deleteTaskSubscription.unsubscribe();
    }
    if (this.stateChangeSubscription) {
      this.stateChangeSubscription.unsubscribe();
    }
  }
}
