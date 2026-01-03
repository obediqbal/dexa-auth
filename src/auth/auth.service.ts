import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { LoginDto, LoginResponseDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingEmail = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingEmail) {
            throw new ConflictException('Email already registered');
        }

        const existingStaffId = await this.prisma.user.findUnique({
            where: { staffId: registerDto.staffId },
        });
        if (existingStaffId) {
            throw new ConflictException('Staff ID already registered');
        }

        const hashedPassword = await this.hashPassword(registerDto.password);

        const user = await this.prisma.user.create({
            data: {
                staffId: registerDto.staffId,
                email: registerDto.email,
                password: hashedPassword,
                role: registerDto.role,
            },
        });

        this.logger.log(`User registered successfully: ${user.email}`);

        return {
            id: user.id,
            staffId: user.staffId,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        };
    }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            this.logger.warn(`Login attempt with non-existent email: ${email}`);
            return null;
        }

        if (!user.isActive) {
            this.logger.warn(`Login attempt by inactive user: ${email}`);
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Invalid password attempt for user: ${email}`);
            return null;
        }

        return user;
    }

    async login(loginDto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload: JwtPayload = {
            sub: user.staffId,
            email: user.email,
            role: user.role,
        };

        const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');
        const accessToken = this.jwtService.sign(payload);

        this.logger.log(`User logged in successfully: ${user.email}`);

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
}
