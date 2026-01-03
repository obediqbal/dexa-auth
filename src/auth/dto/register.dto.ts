import { IsEmail, IsString, MinLength, IsEnum, IsUUID } from 'class-validator';

export enum Role {
    STAFF = 'STAFF',
    ADMIN = 'ADMIN',
}

export class RegisterDto {
    @IsUUID()
    staffId: string;

    @IsEmail({}, { message: 'Please provide a valid email address' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsEnum(Role, { message: 'Role must be either STAFF or ADMIN' })
    role: Role = Role.STAFF;
}
