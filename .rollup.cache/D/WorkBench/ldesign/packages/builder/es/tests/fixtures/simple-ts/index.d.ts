/**
 * 简单的 TypeScript 测试文件
 */
export interface User {
    id: number;
    name: string;
    email: string;
}
export declare class UserManager {
    private users;
    addUser(user: User): void;
    getUser(id: number): User | undefined;
    getAllUsers(): User[];
    removeUser(id: number): boolean;
}
export declare function createUser(id: number, name: string, email: string): User;
export declare const DEFAULT_USER: User;
export default UserManager;
