import { Query, System, World } from "@releaseband/ecs";
import { BodyComponent } from "../components/BodyComponent";
import { GameSettings } from "../constants/GameSettings";


export class MovementSystem implements System {
    private objects: Query;
    private world: World;

    constructor(world: World, objects: Query) {
        this.world = world;
        this.objects = objects;
    }
    
    public update(delta: number): void {
        if (GameSettings.PAUSED) {
            return;
        }
        
        this.objects.entities.forEach((id: number) => {
            let component = this.world.getComponent(id, BodyComponent);            
            component.x += component.velocityX;
            component.y += component.velocityY;
        });
    }
}