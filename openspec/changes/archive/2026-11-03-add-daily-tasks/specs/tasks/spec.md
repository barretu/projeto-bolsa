# Spec Delta

## Purpose

Lets a person record dated to-do items, see them one day at a time, keep track of what is still pending from earlier days, and mark, edit or delete them.

## ADDED Requirements

### Requirement: Task fields
A task SHALL have a title, a date and a done flag. The title MUST be 1 to 200 characters after trimming surrounding whitespace. The date is a calendar day with no time or time zone. A new task SHALL start as not done.

#### Scenario: Valid task is created
- **WHEN** a task is created with title "Buy bread" and date 2026-10-21
- **THEN** the task exists with that title and date, and it is not done

#### Scenario: Blank title is rejected
- **WHEN** a task is created with a title made only of spaces
- **THEN** the request is rejected with error code `TITLE_REQUIRED` and no task is stored

#### Scenario: Title too long is rejected
- **WHEN** a task is created with a 201-character title
- **THEN** the request is rejected with error code `TITLE_TOO_LONG` and no task is stored

### Requirement: Day view
The system SHALL show the tasks of one chosen day, pending tasks first and done tasks after them; within each group, older tasks come first. Done tasks SHALL be displayed struck through.

#### Scenario: Mixed day is ordered
- **WHEN** a day has a done task created before a pending task
- **THEN** the pending task is listed first and the done task is listed after it, struck through

#### Scenario: Other days are not shown
- **WHEN** the user views 2026-10-21
- **THEN** tasks dated on any other day are not in the day list

### Requirement: Day navigation
The Today screen SHALL open on the current day as given by the user's browser, and SHALL offer previous-day and next-day controls.

#### Scenario: Open the screen
- **WHEN** the user opens `/` and the browser's local date is 2026-10-21
- **THEN** the screen shows the tasks of 2026-10-21

#### Scenario: Go to the next day
- **WHEN** the user is viewing 2026-10-21 and activates the next-day control
- **THEN** the screen shows the tasks of 2026-10-22

### Requirement: Quick add
The Today screen SHALL offer a single text field; submitting it with Enter SHALL create a task with that title on the day currently shown and clear the field.

#### Scenario: Add on a future day
- **WHEN** the user is viewing 2026-10-23, types "Dentist" and presses Enter
- **THEN** a task "Dentist" dated 2026-10-23 appears in the list and the field is empty

### Requirement: Overdue section
When the day shown is the current day, the Today screen SHALL show an Overdue section listing every pending task dated before the current day, oldest date first. The section SHALL be hidden when it is empty or when another day is shown.

#### Scenario: Pending task from yesterday
- **WHEN** today is 2026-10-21 and a pending task is dated 2026-10-20
- **THEN** that task appears in the Overdue section on today's view

#### Scenario: Done task from yesterday
- **WHEN** today is 2026-10-21 and a done task is dated 2026-10-20
- **THEN** that task does not appear in the Overdue section

### Requirement: Toggle done
The user SHALL be able to mark a pending task as done and a done task as pending. The display SHALL change only after the server confirms the change.

#### Scenario: Mark as done
- **WHEN** the user marks a pending task as done and the server confirms
- **THEN** the task is shown struck through among the done tasks

#### Scenario: Server fails
- **WHEN** the user marks a task as done and the server returns an error
- **THEN** the task stays as it was and an error toast is shown

### Requirement: Edit task
The user SHALL be able to change a task's title and date. The same title rules as creation apply. A task moved to another day SHALL leave the current day's list.

#### Scenario: Reschedule to tomorrow
- **WHEN** the user changes a task dated 2026-10-21 to 2026-10-22 while viewing 2026-10-21
- **THEN** the task no longer appears in the 2026-10-21 list and appears when viewing 2026-10-22

### Requirement: Delete task
The user SHALL be able to delete a task, after confirming in a dialog. Cancelling the dialog SHALL keep the task.

#### Scenario: Confirmed delete
- **WHEN** the user asks to delete a task and confirms
- **THEN** the task is removed and no longer listed

#### Scenario: Cancelled delete
- **WHEN** the user asks to delete a task and cancels the dialog
- **THEN** the task is still listed

### Requirement: Unknown task
Editing, toggling or deleting a task id that does not exist SHALL fail with HTTP 404 and error code `TASK_NOT_FOUND`.

#### Scenario: Delete a missing task
- **WHEN** a delete is requested for a task id that does not exist
- **THEN** the response is 404 with error code `TASK_NOT_FOUND`

### Requirement: Loading and error feedback
While the day's tasks are loading, the screen SHALL show placeholder rows. When any task request fails, the screen SHALL show an error toast in the current language.

#### Scenario: API is down
- **WHEN** the user opens the Today screen and the API cannot be reached
- **THEN** an error toast is shown
