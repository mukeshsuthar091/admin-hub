import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AppToken } from '../entities/appToken.entity';
import { TokenSession } from '../types/token-session.interface';
import { UserStatus } from '../../../common/enums';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email,
        isDelete: false,
      },
      relations: { role: true },
      select: {
        id: true,
        userCode: true,
        password: true,
        status: true,
        role: {
          name: true,
          isDelete: true,
        },
      },
    });
  }

  findUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, isDelete: false }
    });
  }

  async saveSession(session: TokenSession): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const tokenRepository = manager.getRepository(AppToken);
      const token = tokenRepository.create({ ...session, isExpired: false });
      await tokenRepository.save(token);

      const result = await manager
        .getRepository(User)
        .update(
          { id: session.userId, isDelete: false, status: UserStatus.ACTIVE },
          { lastActiveAt: new Date() },
        );

      if (result.affected !== 1) {
        throw new ForbiddenException('User account is no longer active');
      }
    });
  }
}
