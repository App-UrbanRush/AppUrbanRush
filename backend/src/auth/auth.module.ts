import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { AuthController } from "./infrastructure/controllers/auth.controller";
import { UserModule } from "src/user/user.module";
import { RegisterCourierUseCase } from "./application/use-cases/register-courier.use-case";
import { CourierModule } from "src/courier/courier.module";
import { RegisterVendorUseCase } from './application/use-cases/register-vendor.use-case';
import { VendorModule } from 'src/vendor/vendor.module';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [
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
        CourierModule,
        VendorModule,
        EmailModule,
    ],
    providers: [
        LoginUseCase,
        RegisterUseCase,
        RegisterCourierUseCase,
        JwtStrategy,
        RolesGuard,
        RegisterVendorUseCase,
    ],
    controllers: [AuthController],
    exports: [RolesGuard, JwtStrategy, PassportModule, JwtModule], 
})
export class AuthModule { }
