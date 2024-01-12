import { Logger } from "@nestjs/common";
import { v4 as uuid } from "uuid"
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { Server, Socket } from "socket.io"

enum Color {
  White = 1,
  Black
}

type JoinGamePayload = {
  gameId: string | null,
  playerId: string | null,
  board: unknown[]
}

type WebSocketReturn<T> = {
  event: string,
  data: T
}

type Player = {
  id: string,
  username: string,
  color: Color
}

type Game = {
  id: string,
  players: Player[],
  isPlaying: Color
  board: unknown[]
}

type ChessMovePayload = {
  board: unknown[],
  gameId: string
}

type APIgameState = {
    Game: Game
}


@WebSocketGateway()
export class RoomGateway implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {

  private readonly logger = new Logger(RoomGateway.name)

  private readonly games: Game[] = [] 

  createGame = (games: Game[], playerId: string): Game => {

    //handle double join game event emitting
    const foundGame = this.games.find(game => game.players.some(p => p.id == playerId))
    if(!!foundGame) return foundGame

    let game: Game  = {
      id: "",
      players: [],
      isPlaying: Color.White,
      board: []
    }
    const player: Player = {
      id: playerId,
      username: "guest " + playerId,
      color: Math.random() < 0.5 ? Color.White : Color.Black
    }
    game.players.push(player)
    game.id = uuid()
    this.games.push(game)

    return game
  }

  findGame = (gameId: string | null): Game | null => {
    if(gameId == null) {
      
      const game =  this.games.find(g => g.players.length == 1)
      return game
    }
    else {
      return this.games.find(g => g.id == gameId)
    }
  }

  findGameByPlayerId = (playerId: string) => {
    return this.games.find(g => g.players.some(p => p.id == playerId))
  }

  addPlayerToGame = (game: Game, playerId: string): void => {
    const currentPlayer = game.players[0]
    const newPlayer: Player = { 
      id: playerId,
      username: "guest " + playerId,
      color: currentPlayer.color == Color.White ? Color.Black : Color.White
    }
    game.players.push(newPlayer)
  }

  @WebSocketServer() io: Server = new Server({cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
    allowedHeaders: ["Access-Controll-Allow-Origin"]
  }})

  afterInit(server: any) {
    this.logger.log(`Initialized socket ${server}`) 
  }


  handleConnection(client: any, ...args: any[]) {

    const { sockets }  = this.io.sockets

    this.logger.log(`client ${client.id} connected`)

    this.logger.log(`number of clients connected:  ${sockets.size}`)

  }

  handleDisconnect(client: any) {

    this.logger.log(`client id: ${client.id} disconnected`)

  }


  @SubscribeMessage('chess:join-game')
  handleJoinGame(client: Socket, payload: JoinGamePayload): WebSocketReturn<APIgameState> {


    const { gameId, playerId, board } = payload


    const game = this.findGame(gameId) || this.createGame(this.games, playerId)

    //initial board state 
    if(game?.board?.length <= 0) {
      game.board = board
    }

    client.join(game.id)
    
    if(game.players.length == 1 && !this.findGameByPlayerId(playerId))
      this.addPlayerToGame(game, playerId)

    var initialGameState: APIgameState = {
      Game: game 
    }

    this.io.to(game.id).emit(`chess:join-game`, initialGameState)

    return {
      event: `chess:join-game`,
      data: initialGameState
    }
  }

  @SubscribeMessage('chess:move')
  handleMessage(client: any, payload: ChessMovePayload): WebSocketReturn<any> {

    const { gameId, board } = payload

    const game = this.findGame(gameId)

    game.isPlaying = game.isPlaying == Color.White ? Color.Black : Color.White
    game.board = board

    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${payload}`);

    this.io.to(gameId).emit(`chess:move`, game)

    return {
      event: `chess:move`,
      data: game
    };

  }
}
