import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PeopleEntity } from "src/people/infrastructure/persistence/entities/people.entity";
import { RolEntity } from "src/roles/infrastructure/persistence/entity/rol.entity";
import { UserEntity } from "src/user/infrastructure/persistence/entities/user.entity";
import { UserRolesEntity } from "src/user_rol/infrastructure/persistence/entity/user_rol.entity";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { AuthController } from "./infrastructure/controllers/auth.controller";
import { UserModule } from "src/user/user.module";
import { RegisterCourierUseCase } from "./application/use-cases/register-courier.use-case";
import { CourierModule } from "src/courier/courier.module";

@Module({
    imports: [
        // ConfigModule.forRoot() suele ir solo en el AppModule, aquí no es necesario
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '30m' }
            })
        }),
   
        UserModule,
        CourierModule
    ],
    providers: [
        LoginUseCase,
        RegisterUseCase,
        RegisterCourierUseCase,
        JwtStrategy,
        RolesGuard,
    ],
    controllers: [AuthController],
    exports: [RolesGuard, JwtStrategy, PassportModule], 
})
export class AuthModule { }