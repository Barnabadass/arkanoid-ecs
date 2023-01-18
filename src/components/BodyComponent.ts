import * as PIXI from "pixi.js";


export class BodyComponent {
    public graphicsBody: PIXI.Graphics;
    private initX: number;
    private initY: number;
    private initVelocityX: number;
    private initVelocityY: number;
    public velocityX: number;
    public velocityY: number;

    constructor(graphicsBody: PIXI.Graphics, velX: number = 0, velY: number = 0) {
        this.graphicsBody = graphicsBody;
        this.initX = this.graphicsBody.x;
        this.initY = this.graphicsBody.y;
        this.initVelocityX = this.velocityX = velX || 0;
        this.initVelocityY = this.velocityY = velY || 0;
    }

    public reset(): void {
        this.x = this.initX;
        this.y = this.initY;
        this.velocityX = this.initVelocityX;
        this.velocityY = this.initVelocityY;
    }

    public get x(): number {
        return this.graphicsBody.x;
    }

    public set x(x: number) {
        this.graphicsBody.position.set(x, this.graphicsBody.position.y);
    }

    public get y(): number {
        return this.graphicsBody.y;
    }

    public set y(y: number) {
        this.graphicsBody.position.set(this.graphicsBody.position.x, y);
    }

    public get width(): number {
        return this.graphicsBody.width;
    }

    public get height(): number {
        return this.graphicsBody.height;
    }
}