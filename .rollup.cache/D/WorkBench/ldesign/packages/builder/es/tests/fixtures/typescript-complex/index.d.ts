export interface User {
    id: number;
    name: string;
    email?: string;
}
export declare class UserManager {
    private users;
    addUser(user: User): void;
    getUser(id: number): User | undefined;
    getAllUsers(): User[];
}
export declare function createUser(name: string, email?: string): User;
export default UserManager;
