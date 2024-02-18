// import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
// import { SoketService } from './soket.service';
// import { CreateSoketDto } from './dto/create-soket.dto';
// import { UpdateSoketDto } from './dto/update-soket.dto';

// @WebSocketGateway()
// export class SoketGateway {
//   constructor(private readonly soketService: SoketService) {}

//   @SubscribeMessage('createSoket')
//   create(@MessageBody() createSoketDto: CreateSoketDto) {
//     return this.soketService.create(createSoketDto);
//   }

//   @SubscribeMessage('findAllSoket')
//   findAll() {
//     return this.soketService.findAll();
//   }

//   @SubscribeMessage('findOneSoket')
//   findOne(@MessageBody() id: number) {
//     return this.soketService.findOne(id);
//   }

//   @SubscribeMessage('updateSoket')
//   update(@MessageBody() updateSoketDto: UpdateSoketDto) {
//     return this.soketService.update(updateSoketDto.id, updateSoketDto);
//   }

//   @SubscribeMessage('removeSoket')
//   remove(@MessageBody() id: number) {
//     return this.soketService.remove(id);
//   }
// }

// soket.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class SoketGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): string {
    // When a 'message' event is received, log it and emit a response event
    console.log('Received message:', data);
    const response = 'Server received your message: ' + data;
    this.server.emit('response', response); // Emitting a 'response' event
    return response;
  }
  @SubscribeMessage('hope')
  Message(@MessageBody() data: string): string {
    // When a 'message' event is received, log it and emit a response event
    console.log('Received message:', data);
    const response = 'Server received your message: ' + data;
    this.server.emit('response', response); // Emitting a 'response' event
    return response;
  }
}
