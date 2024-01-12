import type { IUser } from '../interfaces/IUser'

export class User implements IUser {

    public id: number
    public firstName: string
    public lastName: string
    public userName: string
    public password: string

}