import { ApiProperty } from '@nestjs/swagger';

export class CreatedUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ example: 'USR-0076' })
  code: string;
  @ApiProperty({ example: 'VIEWER' })
  role: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ type: String, format: 'date-time' })
  created: Date;
}

export class CreateUserResponseDto {
  @ApiProperty({ example: 201 })
  statusCode: number;
  @ApiProperty({ example: 'user is registered' })
  message: string;
  @ApiProperty({ type: CreatedUserDto })
  data: CreatedUserDto;
}

export class BulkUpdateResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;
  @ApiProperty({ example: 'Users updated successfully' })
  message: string;
}
