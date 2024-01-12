import { Test } from "@nestjs/testing";
import { RoomGateway } from "./room.gateway";
import { INestApplication } from "@nestjs/common";
import { Socket, io } from "socket.io-client";

async function createNestApp(...gateways: any): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile();
  return testingModule.createNestApplication();
}

describe("RoomGateway", () => {
  let gateway: RoomGateway;
  let app: INestApplication;
  let ioClient: Socket;

  beforeAll(async () => {
    // Instantiate the app
    app = await createNestApp(RoomGateway);
    // Get the gateway instance from the app instance
    gateway = app.get<RoomGateway>(RoomGateway);
    // Create a new client that will interact with the gateway
    ioClient = io("http://localhost:3000", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });

    app.listen(3000);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should be defined`, () => {
    expect(ioClient).toBeDefined();
  });

  it('should emit "pong" on "message"', async () => {
    ioClient.connect();
    // expect(ioClient.connected).toBe(true)
    ioClient.emit("message", "test");
    await new Promise<void>((resolve) => {
      ioClient.on("connect", () => {
        console.log("connected");
      });
      ioClient.on("pong", (data) => {
        resolve();
        expect(data).toBe("Hello World!");
        resolve();
      });
    });
    ioClient.disconnect();
  });
});