export class UserManager {
    constructor() {
        this.users = [];
    }
    addUser(user) {
        this.users.push(user);
    }
    getUser(id) {
        return this.users.find(user => user.id === id);
    }
    getAllUsers() {
        return [...this.users];
    }
}
export function createUser(name, email) {
    return {
        id: Math.floor(Math.random() * 1000),
        name,
        email: email || undefined
    };
}
export default UserManager;
//# sourceMappingURL=index.js.map