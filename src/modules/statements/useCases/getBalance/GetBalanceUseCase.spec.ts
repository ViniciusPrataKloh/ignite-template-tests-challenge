import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

let getBalanceUseCase: GetBalanceUseCase;

let createdUser: User;
let deposit: Statement;
let withdraw: Statement;

describe("Get Balance", () => {

    beforeEach(async () => {
        usersRepositoryInMemory = new InMemoryUsersRepository();
        statementsRepositoryInMemory = new InMemoryStatementsRepository();

        createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
        createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

        getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);

        const user: ICreateUserDTO = {
            name: "User",
            email: "user@email.com",
            password: "user"
        };

        createdUser = await createUserUseCase.execute(user);

        deposit = await createStatementUseCase.execute({
            user_id: createdUser.id as string,
            type: "deposit" as OperationType,
            amount: 100,
            description: "Deposit"
        });

        withdraw = await createStatementUseCase.execute({
            user_id: createdUser.id as string,
            type: "withdraw" as OperationType,
            amount: 50,
            description: "Withdraw"
        });
    });

    it("should be able to get balance", async () => {
        const user_id = createdUser.id as string;
        const balance = await getBalanceUseCase.execute({ user_id });

        expect(balance.statement[0]).toHaveProperty("id");
        expect(balance.statement[1]).toHaveProperty("id");
        expect(balance.balance).toEqual(50);
    });

    it("should not be able to get balance for invalid user", async () => {
        expect(async () => {
            const user_id = "1a2b3c";
            const balance = await getBalanceUseCase.execute({ user_id });
        }).rejects.toBeInstanceOf(GetBalanceError);
    });

});
