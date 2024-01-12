import { Controller, Get } from '@nestjs/common';
import { UserService } from 'src/services/user.service';

function isStringArray(users: unknown): users is string[] {
    return Array.isArray(users) && users.every(u => typeof u === "string")
}

@Controller("/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
   const users = this.userService.getUsers() 
   if(isStringArray(users)) {
    return users.join(" ")
   } else {
    return "Failure"
   }
  }
  
}
