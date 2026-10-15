import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { getEnv, parseTtlToSeconds } from '@gq/config';
import { UserRepository, USER_REPOSITORY_TOKEN, UserRecord } from '@gq/domain';
import { getLogger } from '@gq/observability';

@Injectable()
export class AuthService {
  private readonly logger = getLogger().child({ service: 'AuthService' });
  private readonly env = getEnv();

  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: { email: string; phone: string; password: string; fullName: string; dateOfBirth?: string }) {
    const existing = await this.userRepo.findByEmailOrPhone({ email: dto.email, phone: dto.phone });
    if (existing) throw new ConflictException('Email or phone already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      fullName: dto.fullName,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      roles: ['CUSTOMER'],
    });

    const tokens = await this.issueTokens(user);
    await this.userRepo.storeRefreshToken(user.id, tokens.refreshToken, new Date(Date.now() + parseTtlToSeconds(this.env.JWT_REFRESH_TTL) * 1000));
    return tokens;
  }

  async login(dto: { identifier: string; password: string; rememberMe?: boolean }) {
    const user = await this.userRepo.findByEmailOrPhone(
      dto.identifier.includes('@') ? { email: dto.identifier } : { phone: dto.identifier }
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.mfaEnabled) {
      throw new UnauthorizedException('MFA not implemented in scaffold');
    }

    const tokens = await this.issueTokens(user);
    await this.userRepo.storeRefreshToken(user.id, tokens.refreshToken, new Date(Date.now() + parseTtlToSeconds(this.env.JWT_REFRESH_TTL) * 1000));
    return tokens;
  }

  async refresh(refreshToken: string) {
    const stored = await this.userRepo.findRefreshToken(refreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.userRepo.revokeRefreshToken(refreshToken);

    const user = await this.userRepo.findById(stored.userId);
    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.issueTokens(user);
    await this.userRepo.storeRefreshToken(user.id, tokens.refreshToken, new Date(Date.now() + parseTtlToSeconds(this.env.JWT_REFRESH_TTL) * 1000));
    return tokens;
  }

  async logout(userId: string) {
    await this.userRepo.revokeAllUserRefreshTokens(userId);
  }

  private async issueTokens(user: UserRecord) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.env.JWT_ACCESS_TTL });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: this.env.JWT_REFRESH_TTL });
    return {
      accessToken,
      refreshToken,
      expiresIn: parseTtlToSeconds(this.env.JWT_ACCESS_TTL),
      tokenType: 'Bearer' as const,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        roles: user.roles,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }
}