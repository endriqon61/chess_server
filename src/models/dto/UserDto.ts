import { IUser } from "../interfaces/IUser";

export class UserDto implements Omit<IUser, "id"> {
    public firstName: string;
    public lastName: string;
    public userName: string;
    public password: string;
}