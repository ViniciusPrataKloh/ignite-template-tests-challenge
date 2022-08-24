import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    });

    it("should be able to list user's profile by id", async () => {
        const user: ICreateUserDTO = {
            name: "User",
            email: "user@email.com",
            password: "user"
        };

        const createdUser = await createUserUseCase.execute(user);

        expect(createdUser).toHaveProperty("id");

        const listedUserProfile = await showUserProfileUseCase.execute(createdUser.id as string);
        const passwordMatch = await compare(user.password, listedUserProfile.password);

        expect(listedUserProfile).toHaveProperty("id");
        expect(listedUserProfile.name).toEqual(user.name);
        expect(listedUserProfile.email).toEqual(user.email);
        expect(passwordMatch).toEqual(true);
    });

    it("should not be able to list a non existent user", async () => {
        expect(async () => {
            await showUserProfileUseCase.execute(
                "74a1590f-3949-4404-b161-875a7aa4f296"
            );
        }).rejects.toBeInstanceOf(ShowUserProfileError);
    });

});