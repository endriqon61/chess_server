import { Module } from "@nestjs/common";
import { RoomGateway } from "src/websocket/room/room.gateway";

@Module({
    providers: [RoomGateway]
})
export class EventsModule {}


