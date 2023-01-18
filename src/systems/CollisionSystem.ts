import { Query, System, World } from "@releaseband/ecs";
import { BodyComponent } from "../components/BodyComponent";
import { GameSettings } from "../constants/GameSettings";


export class CollisionSystem implements System {
    private objects: Query;
    private world: World;
    private onCollideCallback: (entity1: number, entity2: number) => void;

    constructor(world: World, objects: Query, onCollide: (entity1: number, entity2: number) => void) {
        this.world = world;
        this.objects = objects;
        this.onCollideCallback = onCollide;
    }

    public update(delta: number): void {
        if (GameSettings.PAUSED) {
            return;
        }

        for (let entity of this.objects.entities) {
            let component = this.world.getComponent(entity, BodyComponent);
            let { velocityX, velocityY } = component;
            if (velocityX !== 0 || velocityY !== 0) {
                for (let otherEntity of this.objects.entities) {
                    if (entity !== otherEntity) {
                        let otherComponent = this.world.getComponent(otherEntity, BodyComponent);
                        if ((velocityX > 0 && this.hasCollision(component, otherComponent, "right")) || (velocityX < 0 && this.hasCollision(component, otherComponent, "left"))) {
                            this.onCollideCallback(entity, otherEntity);
                            let isBouncy = this.world.hasTag(entity, "bouncy");
                            component.velocityX = isBouncy ? -velocityX : 0;
                            if (isBouncy && otherComponent.velocityX !== 0) {
                                if ((otherComponent.velocityX < 0 && velocityX > 0) || (otherComponent.velocityX > 0 && velocityX < 0)) {
                                    component.velocityX = -velocityX;
                                }
                            }
                        }
                        if ((velocityY > 0 && this.hasCollision(component, otherComponent, "down")) || (velocityY < 0 && this.hasCollision(component, otherComponent, "up", entity == 0 && otherEntity == 2))) {
                            this.onCollideCallback(entity, otherEntity);
                            let isBouncy = this.world.hasTag(entity, "bouncy");
                            component.velocityY = isBouncy ? -velocityY : 0;
                            if (isBouncy && otherComponent.velocityX !== 0) {
                                if ((otherComponent.velocityX < 0 && velocityX > 0) || (otherComponent.velocityX > 0 && velocityX < 0)) {
                                    component.velocityX = -velocityX;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private hasCollision(component: BodyComponent, other: BodyComponent, direction: string, tolog: boolean = false): boolean {
        let { x, y, width, height } = component;
        let { x: otherX, y: otherY, height: otherHeight, width: otherWidth } = other;
        if (direction === "right") {
            if (x + width / 2 >= otherX - otherWidth / 2 && x <= otherX - otherWidth / 2 && (y >= otherY - otherHeight / 2 && y <= otherY + otherHeight / 2)) {
                return true;
            }
        }
        if (direction === "left") {
            if (x - width / 2 <= otherX + otherWidth / 2 && x >= otherX + otherWidth / 2 && (y >= otherY - otherHeight / 2 && y <= otherY + otherHeight / 2)) {
                return true;
            }
        }
        if (direction === "down") {
            if ((x >= otherX - otherWidth / 2 && x <= otherX + otherWidth / 2) && y + height / 2 >= otherY - otherHeight / 2 && y <= otherY - otherHeight / 2) {
                return true;
            }
        }
        if (direction === "up") {
            if ((x >= otherX - otherWidth / 2 && x <= otherX + otherWidth / 2) && y - height / 2 <= otherY + otherHeight / 2 && y >= otherY + otherHeight / 2) {
                return true;
            }
        }
        return false;
    }
}