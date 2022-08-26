import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUserRepository: InMemoryUsersRepository;
let createUserUserCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

let createdUser: User;

describe("Create Statement", () => {

    beforeEach(async () => {
        inMemoryUserRepository = new InMemoryUsersRepository();
        createUserUserCase = new CreateUserUseCase(inMemoryUserRepository);
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(
            inMemoryUserRepository,
            inMemoryStatementsRepository
        );

        const user: ICreateUserDTO = {
            name: "User",
            email: "user@email.com",
            password: "user"
        };

        createdUser = await createUserUserCase.execute(user);
    });

    it("should be able to make a new deposit statement", async () => {

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

    it("should be able to make a new withdraw", async () => {
        let statement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: "deposit" as OperationType,
            amount: 100.00,
            description: "Deposit"
        }

        const deposit = await createStatementUseCase.execute(statement);

        statement = {
            user_id: createdUser.id as string,
            type: "withdraw" as OperationType,
            amount: 50.00,
            description: "Withdraw"
        };

        const withdraw = await createStatementUseCase.execute(statement);

        expect(withdraw).toHaveProperty("id");
        expect(withdraw.user_id).toBe(createdUser.id);
        expect(withdraw.type).toBe(statement.type);
        expect(withdraw.amount).toBe(statement.amount);
        expect(withdraw.description).toBe(statement.description);
    });

    it("should not be able to make a new withdraw if the user has insufficient funds", async () => {
        expect(async () => {
            const statement: ICreateStatementDTO = {
                user_id: createdUser.id as string,
                type: "withdraw" as OperationType,
                amount: 50.00,
                description: "Withdraw"
            };

            const withdraw = await createStatementUseCase.execute(statement);

        }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    });

    it("should not be able to make a deposit by a non existent user", async () => {
        expect(async () => {
            const statement: ICreateStatementDTO = {
                user_id: "4a1590f-3949-4404-b161-875a7aa4f296",
                type: "deposit" as OperationType,
                amount: 50.00,
                description: "Deposit"
            };

            const deposit = await createStatementUseCase.execute(statement);

        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    });

    it("should not be able to make a withdraw by a non existent user", async () => {
        expect(async () => {
            const statement: ICreateStatementDTO = {
                user_id: "4a1590f-3949-4404-b161-875a7aa4f296",
                type: "withdraw" as OperationType,
                amount: 50.00,
                description: "Withdraw"
            };

            const withdraw = await createStatementUseCase.execute(statement);

        }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    });

});