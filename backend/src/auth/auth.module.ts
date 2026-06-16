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
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case";
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case";
import { VerifyCodeUseCase } from "./application/use-cases/verify-code.use-case";
import { SetPasswordUseCase } from "./application/use-cases/set-password.use-case";
import { GoogleStrategy } from "./infrastructure/strategies/google.strategy";
import { GoogleAuthGuard } from "./infrastructure/guards/google-auth.guard";
import { GoogleLoginUseCase } from "./application/use-cases/google-login.use-case";
import { UserRolModule } from "src/user_rol/user_rol.module";

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
        UserRolModule,
    ],
    providers: [
        LoginUseCase,
        RegisterUseCase,
        RegisterCourierUseCase,
        JwtStrategy,
        RolesGuard,
        RegisterVendorUseCase,
        ForgotPasswordUseCase,
        ResetPasswordUseCase,
        VerifyCodeUseCase,
        SetPasswordUseCase,
        GoogleStrategy,      
        GoogleAuthGuard,   
        GoogleLoginUseCase,
    ],
    controllers: [AuthController],
    exports: [RolesGuard, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule { }
