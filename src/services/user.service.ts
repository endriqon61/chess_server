import { Injectable } from "@nestjs/common";
import { IUserService } from "src/contracts/userService";

@Injectable()
export class UserService implements IUserService {
   public getUsers: () => unknown[] = () => {
    return ["Hello", "Nest", 3]
   }; 
   find: (id: number) => unknown[];
}