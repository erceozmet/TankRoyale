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
    this.state.client_addresses.push(client.sessionId)
    console.log(client.sessionId, "joined!");
  }

  onLeave (client: Client, consented: boolean) {
    for (let i = 0; i < this.state.client_addresses.length; i++){
      if (this.state.client_addresses[i] == client.sessionId){
        this.state.client_addresses.splice(i, 1)
        console.log(client.sessionId, "left!");
      }
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
