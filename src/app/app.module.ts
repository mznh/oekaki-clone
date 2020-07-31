import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ScrollingModule } from '@angular/cdk/scrolling';
//import { CdkScrollableModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasComponent } from './canvas/canvas.component';
import { ConnectService } from './service/connect.service';
import { Paint, Action, Point, Color, Brush } from './models/action';
import { ChatComponent } from './chat/chat.component';
import { InfoBannerComponent } from './info-banner/info-banner.component';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { LobbyPageComponent } from './lobby-page/lobby-page.component';


@NgModule({
  declarations: [
    AppComponent,
    LobbyPageComponent,
    CanvasComponent,
    ChatComponent,
    InfoBannerComponent,
    GameScreenComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    ScrollingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
