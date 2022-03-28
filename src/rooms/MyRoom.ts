import { Room, Client } from "colyseus";
import { MyRoomState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  
  onCreate (options: any) {
    this.setState(new MyRoomState());
    
    this.onMessage("button", (client, button) => {
      console.log("MyRoom received button from", client.sessionId, ":", button);
  
      this.broadcast("buttons", `(${client.sessionId}) ${button}`);
    });
  }


  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
