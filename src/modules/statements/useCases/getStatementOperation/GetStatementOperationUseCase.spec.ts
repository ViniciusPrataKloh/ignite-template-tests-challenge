import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

let getStatementOperationUseCase: GetStatementOperationUseCase;

let createdUser: User;

describe("Get Statement Operation", () => {

    beforeEach(async () => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        inMemoryStatementsRepository = new InMemoryStatementsRepository();

        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);

        const user: ICreateUserDTO = {
            name: "User",
            email: "user@email.com",
            password: "user"
        };

        createdUser = await createUserUseCase.execute(user);
    });

    it("it should be able to get statement", async () => {

        const statement: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: "deposit" as OperationType,
            amount: 100,
            description: "Deposit"
        }

        const deposit = await createStatementUseCase.execute(statement);

        expect(deposit).toHaveProperty("id");

        const resultStatement = await getStatementOperationUseCase.execute({
            user_id: createdUser.id as string,
            statement_id: deposit.id as string
        });

        expect(resultStatement).toHaveProperty("id");
        expect(resultStatement.user_id).toEqual(createdUser.id);
        expect(resultStatement.id).toEqual(resultStatement.id);
        expect(resultStatement.type).toEqual(resultStatement.type);
        expect(resultStatement.amount).toEqual(resultStatement.amount);
        expect(resultStatement.description).toEqual(resultStatement.description);
    });

    it("it should not be able to get non-existent statement", async () => {
        expect(async () => {
            await getStatementOperationUseCase.execute({
                user_id: createdUser.id as string,
                statement_id: "4d5e6f"
            });
        }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    });

    it("it should not be able to get statement of invalid user", async () => {
        expect(async () => {
            const statement: ICreateStatementDTO = {
                user_id: createdUser.id as string,
                type: "deposit" as OperationType,
                amount: 100,
                description: "Deposit"
            }

            const deposit = await createStatementUseCase.execute(statement);

            expect(deposit).toHaveProperty("id");

            const resultStatement = await getStatementOperationUseCase.execute({
                user_id: "1a2b3c",
                statement_id: deposit.id as string
            });
        }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    });

});
