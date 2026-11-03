# Spec Delta

## Purpose

Shows the interface in Brazilian Portuguese or English, picks a sensible language on first visit, and lets the user switch at any time.

## ADDED Requirements

### Requirement: Supported languages
The UI SHALL be available in pt-BR and en. Every interface text, including error messages derived from API error codes, SHALL exist in both languages. Text written by the user (such as task titles) SHALL never be translated.

#### Scenario: Error code is translated
- **WHEN** the API rejects a task with `TITLE_TOO_LONG` and the UI is in pt-BR
- **THEN** the user sees the pt-BR message for that error

#### Scenario: User text is untouched
- **WHEN** the UI is switched from pt-BR to en
- **THEN** a task titled "Comprar pão" is still shown as "Comprar pão"

### Requirement: Language on first visit
When no language choice has been stored, the UI SHALL use pt-BR if the browser's preferred language is Portuguese, and en otherwise.

#### Scenario: Portuguese browser
- **WHEN** a first-time visitor's browser prefers `pt-PT`
- **THEN** the UI is shown in pt-BR

#### Scenario: Other browser language
- **WHEN** a first-time visitor's browser prefers `es`
- **THEN** the UI is shown in en

### Requirement: Language switcher
The header SHALL offer a language switcher. Choosing a language SHALL change the UI immediately, keep the current URL, and store the choice in a cookie that takes precedence over the browser language on later visits.

#### Scenario: Switch and come back
- **WHEN** the user switches to en, closes the browser, and opens the app again
- **THEN** the UI is shown in en regardless of the browser language

### Requirement: Localized dates
Dates shown in the UI SHALL be formatted for the current language.

#### Scenario: Same date in both languages
- **WHEN** the day shown is 2026-10-21
- **THEN** the heading reads in Portuguese style (e.g. "21 de out.") in pt-BR and in English style (e.g. "Oct 21") in en
