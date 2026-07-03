import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';
import { StockService } from './stock.service';
import { FairValueCalculatorComponent } from './fair-value-calculator.component';

@NgModule({
  declarations: [AppComponent, FairValueCalculatorComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
  providers: [AuthService, StockService],
  bootstrap: [AppComponent]
})
export class AppModule { }
