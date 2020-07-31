import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameScreenComponent } from './game-screen/game-screen.component';
import { LobbyPageComponent } from './lobby-page/lobby-page.component';


const routes: Routes = [
  { path: 'room', component: GameScreenComponent },
  { path: '', component: LobbyPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
