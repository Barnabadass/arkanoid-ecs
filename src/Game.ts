import * as PIXI from "pixi.js";
import { World } from '@releaseband/ecs';
import { GameSettings } from "./constants/GameSettings";
import { BodyComponent } from "./components/BodyComponent";
import { MovementSystem } from "./systems/MovementSystem";
import { CollisionSystem } from "./systems/CollisionSystem";
import { InputControlledObject } from "./components/InputControlledObject";
import { InputSystem } from "./systems/InputSystem";


export class Game {
    public world: World;
    public stage: PIXI.Container;
    public renderer: PIXI.IRenderer;
    private entities: { [key: string]: number } = {};
    private introText: PIXI.Text;

    constructor() {
        this.world = new World(6);

        let app = new PIXI.Application({
            width: GameSettings.GAME_WIDTH,
            height: GameSettings.GAME_HEIGHT
        });
        //@ts-ignore
        document.body.appendChild(app.view);
        this.stage = app.stage;
        this.renderer = app.renderer;

        this.introText = new PIXI.Text("Welcome!\nMove the stick with the left and right arrow keys.\nDon't let the ball fall.\nPress Enter to start.\nGood Luck!", {
            fill: 0xffffff,
            align: "center",
            fontSize: "20px"
        });
        this.introText.anchor.set(0.5, 0.5);
        this.introText.position.set(GameSettings.GAME_WIDTH / 2, GameSettings.GAME_HEIGHT / 2);
        this.stage.addChild(this.introText);


        this.world.registerComponent(BodyComponent);
        this.world.registerComponent(InputControlledObject);

        let ball = this.entities["ball"] = this.world.createEntity("ball");
        let stick = this.entities["stick"] = this.world.createEntity("stick");
        let topWall = this.entities["topWall"] = this.world.createEntity("topWall");
        let bottomWall = this.entities["bottomWall"] = this.world.createEntity("bottomWall");
        let leftWall = this.entities["leftWall"] = this.world.createEntity("leftWall");
        let rightWall = this.entities["rightWall"] = this.world.createEntity("rightWall");
        let wallThickness = 20;

        let ballGraphics = new PIXI.Graphics().beginFill(0x0000ff).drawCircle(0, 0, 15).endFill();
        let stickGraphics = new PIXI.Graphics().beginFill(0xff0000).drawRect(0, 0, 100, 20).endFill();
        let topWallGraphics = new PIXI.Graphics().beginFill(0x00ff00).drawRect(0, 0, GameSettings.GAME_WIDTH, wallThickness).endFill();
        let bottomWallGraphics = new PIXI.Graphics().beginFill(0x00ff00).drawRect(0, 0, GameSettings.GAME_WIDTH, wallThickness).endFill();
        let leftWallGraphics = new PIXI.Graphics().beginFill(0x00ff00).drawRect(0, 0, wallThickness, GameSettings.GAME_HEIGHT).endFill();
        let rightWallGraphics = new PIXI.Graphics().beginFill(0x00ff00).drawRect(0, 0, wallThickness, GameSettings.GAME_HEIGHT).endFill();

        stickGraphics.pivot.set(stickGraphics.width / 2, stickGraphics.height / 2);
        topWallGraphics.pivot.set(topWallGraphics.width / 2, topWallGraphics.height / 2);
        bottomWallGraphics.pivot.set(bottomWallGraphics.width / 2, bottomWallGraphics.height / 2);
        leftWallGraphics.pivot.set(leftWallGraphics.width / 2, leftWallGraphics.height / 2);
        rightWallGraphics.pivot.set(rightWallGraphics.width / 2, rightWallGraphics.height / 2);

        ballGraphics.position.set(GameSettings.GAME_WIDTH / 2, GameSettings.GAME_HEIGHT * 0.8);
        stickGraphics.position.set(GameSettings.GAME_WIDTH / 2, GameSettings.GAME_HEIGHT * 0.8 + 26);
        topWallGraphics.position.set(GameSettings.GAME_WIDTH / 2, -wallThickness / 2);
        bottomWallGraphics.position.set(GameSettings.GAME_WIDTH / 2, GameSettings.GAME_HEIGHT + wallThickness / 2);
        leftWallGraphics.position.set(-wallThickness / 2, GameSettings.GAME_HEIGHT / 2);
        rightWallGraphics.position.set(GameSettings.GAME_WIDTH + wallThickness / 2, GameSettings.GAME_HEIGHT / 2);

        this.stage.addChild(ballGraphics);
        this.stage.addChild(stickGraphics);
        this.stage.addChild(topWallGraphics);
        this.stage.addChild(bottomWallGraphics);
        this.stage.addChild(leftWallGraphics);
        this.stage.addChild(rightWallGraphics);

        this.world.addComponent(ball, new BodyComponent(ballGraphics, this.getRandomBallVelocityX(), -GameSettings.BALL_SPEED));
        this.world.registerTags(["bouncy"]);
        this.world.addTag(ball, "bouncy");
        this.world.addComponent(stick, new BodyComponent(stickGraphics));
        this.world.registerTags(["inputControlled"]);
        this.world.addTag(stick, "inputControlled");
        // this.world.addComponent(stick, new InputControlledObject());
        this.world.addComponent(topWall, new BodyComponent(topWallGraphics));
        this.world.addComponent(bottomWall, new BodyComponent(bottomWallGraphics));
        this.world.addComponent(leftWall, new BodyComponent(leftWallGraphics));
        this.world.addComponent(rightWall, new BodyComponent(rightWallGraphics));

        let bodyQuery = this.world.createQuery([BodyComponent]);
        // let inputQuery = this.world.createQuery([BodyComponent, InputControlledObject]);

        let movementSystem = new MovementSystem(this.world, bodyQuery);
        let collisionSystem = new CollisionSystem(this.world, bodyQuery, (entity: number, otherEntity: number) => this.checkForGameOver(entity, otherEntity));
        let inputSystem = new InputSystem(this.world, bodyQuery);

        this.world.addSystem(inputSystem);
        this.world.addSystem(movementSystem);
        this.world.addSystem(collisionSystem);

        document.addEventListener("keyup", (e) => {
            if (GameSettings.PAUSED) {
                if (e.code === "Enter") {
                    GameSettings.PAUSED = false;
                    this.introText.visible = false;
                }
            }
        });
        this.update();
    }

    public update(dt: number = 0): void {
        this.world.update(dt);
        this.renderer.render(this.stage);
        requestAnimationFrame((delta: number) => this.update(delta));
    }

    public getRandomBallVelocityX(): number {
        let movesRight = Math.random() > 0.5;
        let speed = 0;
        do {
            speed = Math.round(Math.random() * GameSettings.BALL_SPEED);
        } while (speed === 0);
        if (!movesRight) {
            speed = -speed;
        }
        return speed;
    }

    public checkForGameOver(collidedEntity1: number, collidedEntity2: number): void {
        if (collidedEntity1 === this.entities["ball"] && collidedEntity2 === this.entities["bottomWall"]) {
            GameSettings.PAUSED = true;
            let stickBody = this.world.getComponent(this.entities["stick"], BodyComponent);
            stickBody.reset();
            let ballBody = this.world.getComponent(this.entities["ball"], BodyComponent);
            ballBody.reset();
            ballBody.velocityX = this.getRandomBallVelocityX();
            this.introText.visible = true;
        }
    }
}