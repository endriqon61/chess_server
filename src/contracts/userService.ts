export interface IUserService {
    getUsers: () => unknown[]
    find: (id: number) => unknown[]
}