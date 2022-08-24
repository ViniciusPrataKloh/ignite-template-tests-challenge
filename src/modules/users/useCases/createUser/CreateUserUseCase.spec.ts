import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });


    it("should be able to create a new user", async () => {
        const user = await createUserUseCase.execute({
            name: "User",
            email: "user@email.com",
            password: "user"
        });

        expect(user).toHaveProperty("id");
        expect(user.name).toBe("User");
        expect(user.email).toBe("user@email.com");
    });

    it("should not be able to create a new user when email already exists", async () => {
        expect(async () => {
            const user1 = await createUserUseCase.execute({
                name: "User1",
                email: "user@email.com",
                password: "user"
            });

            const user2 = await createUserUseCase.execute({
                name: "User2",
                email: "user@email.com",
                password: "user"
            });

        }).rejects.toBeInstanceOf(CreateUserError);
    });

});