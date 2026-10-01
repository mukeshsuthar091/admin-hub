import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({
    description:
      'Refresh token (field name follows the requested API contract)',
  })
  refreshToken: string;
}

export class LoginSuccessResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ type: LoginResponseDto })
  data: LoginResponseDto;
}
