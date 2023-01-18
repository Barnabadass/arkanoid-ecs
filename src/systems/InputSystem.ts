import { Query, System, World } from "@releaseband/ecs";
import { BodyComponent } from "../components/BodyComponent";
import { GameSettings } from "../constants/GameSettings";


export class InputSystem implements System {
    private objects: Query;
    private world: World;
    private arrowLeftPressed: boolean = false;
    private arrowRightPressed: boolean = false;

    constructor(world: World, objects: Query) {
        this.world = world;
        this.objects = objects;

        document.addEventListener("keyup", (e) => {
            if (e.code === "ArrowLeft") {
                this.arrowLeftPressed = false;
            }
            if (e.code === "ArrowRight") {
                this.arrowRightPressed = false;
            }
            if (!this.arrowLeftPressed && !this.arrowRightPressed) {
                this.objects.entities.forEach((id: number) => {
                    let component = this.world.getComponent(id, BodyComponent);
                    if (this.world.hasTag(id, "inputControlled")) {
                        component.velocityX = 0;
                    }
                });
            }
        });

        document.addEventListener("keydown", (e) => {
            if (!GameSettings.PAUSED) {
                if (e.code === "ArrowLeft") {
                    this.arrowLeftPressed = true;
                }
                if (e.code === "ArrowRight") {
                    this.arrowRightPressed = true;
                }
            }
        });
    }

    public update(delta: number): void {
        if (GameSettings.PAUSED) {
            return;
        }

        this.objects.entities.forEach((id: number) => {
            let component = this.world.getComponent(id, BodyComponent);
            if (this.world.hasTag(id, "inputControlled")) {
                if (this.arrowLeftPressed && component.velocityX > -GameSettings.STICK_SPEED) {
                    component.velocityX -= GameSettings.STICK_SPEED;
                }
                if (this.arrowRightPressed && component.velocityX < GameSettings.STICK_SPEED) {
                    component.velocityX += GameSettings.STICK_SPEED;
                }
            }
        });
    }
}