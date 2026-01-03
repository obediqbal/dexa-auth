export class LoginResponseDto {
    accessToken: string;
    tokenType: string;
    expiresIn: string;
    user: {
        id: string;
        email: string;
        role: 'STAFF' | 'ADMIN';
    };
}
