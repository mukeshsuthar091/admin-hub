import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ example: 102 })
  totalUsers: number;

  @ApiProperty({ example: 36 })
  activeUsers: number;

  @ApiProperty({ example: 8 })
  newThisMonth: number;
}

export class UserStatsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ type: UserStatsDto })
  data: UserStatsDto;
}
