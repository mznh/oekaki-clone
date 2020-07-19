export class MouseAction{
  public actionType: string;
  public x: number;
  public y: number;
  constructor(t:string,x:number,y:number){
    this.actionType = t;
    this.x = x;
    this.y = y;
  }
}
