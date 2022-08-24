import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUserCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let createdUser: User;

describe("Create Statement", () => {

    beforeEach(() => {
        inMemoryUserRepository = new InMemoryUsersRepository();
        createUserUserCase = new CreateUserUseCase(inMemoryUserRepository);
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(
            inMemoryUserRepository,
            inMemoryStatementsRepository
        );
    });

    it("should be able to create a new deposit statement", async () => {
        const user: ICreateUserDTO = {
            name: "User",
            email: "user@email.com",
            password: "user"
        };

        createdUser = await createUserUserCase.execute(user);

        const statement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: "deposit" as OperationType,
            amount: 100.00,
            description: "Deposit"
        }

        const deposit = await createStatementUseCase.execute(statement);

        expect(deposit).toHaveProperty("id");
        expect(deposit.user_id).toBe(createdUser.id);
        expect(deposit.amount).toBe(statement.amount);
        expect(deposit.type).toBe(statement.type);
        expect(deposit.description).toBe(statement.description);
    });

});