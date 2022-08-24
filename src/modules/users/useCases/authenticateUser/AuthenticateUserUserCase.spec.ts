import { hash } from "bcryptjs";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    })

    it("should be able to authenticate an user with corrected email and password", async () => {
        const user: ICreateUserDTO = {
            name: "User",
            email: "user@email.com",
            password: "user"
        };

        await createUserUseCase.execute(user);

        const userResponse = await authenticateUserUseCase.execute({
            email: user.email,
            password: user.password
        });

        expect(userResponse).toHaveProperty("token");
    });

    it("should not be able to authenticate a non existent user", async () => {
        expect(async () => {
            await authenticateUserUseCase.execute({
                email: "user@email.com",
                password: "user"
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("should not be able to authenticate an user with incorrected password", async () => {
        expect(async () => {
            const user: ICreateUserDTO = {
                name: "User",
                email: "user@email.com",
                password: "user"
            };

            await createUserUseCase.execute(user);

            await authenticateUserUseCase.execute({
                email: user.email,
                password: "abcde"
            });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

});