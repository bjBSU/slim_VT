# LoggerDisplay

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.1.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


# User Guide - Setup

## 1. Git clone this repository  

## 2. Install necessary imports

## 3. Create runner file  

## 4. Add the logger configure line to runner if not already added
  Inside runner adding the following commands to ensure that the node.js server will be set up.

## 5. Open two separate anaconda terminals
  In one terminal go to the location of the cloned repository.
  In the other go to the location of the runner file.

  5.1 First in the terminal with the Angular logger component enter - ng serve - once inside the logger,     this     (in a few seconds will spin up the angular application. Once its spun up click or go to the location.
  
  5.2 In the second terminal start up the runner soon after by running - python runner.py
  
## * Note *  
Once both terminals are running wait a couple of seconds and the modules should show (the more complicated the connections the longer it may take).

If you need to restart the runner for whatever reason close the old and then refresh the angular application.

If you need to restart the angular application, stop the runner and follow step 5.
