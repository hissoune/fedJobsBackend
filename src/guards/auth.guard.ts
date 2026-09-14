import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthGuard {
    constructor(
        private readonly jwtService: JwtService,
    ) {}

   async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);
    if (!token) {
        return false;
    }

    console.log('tokk ',token);
    

  try{
        const decodedToken = await this.jwtService.verifyAsync(token);
        
        request.user = decodedToken.user || decodedToken; 
        return true;
    } catch (error) {
        
        throw new UnauthorizedException('invalid token')
    }
}
  
    extractToken(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
        return null;
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1];
    }
}
