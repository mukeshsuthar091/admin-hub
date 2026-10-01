import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Put,
  Post,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards';
import { PaginatedData } from '../../common/types';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UserListItemDto, UserListResponseDto } from './dto/user-list.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserDetailDto,
  UserDetailResponseDto,
  UserPersonalInfoDto,
  UserPersonalInfoResponseDto,
} from './dto/user-detail.dto';
import { UsersService } from './users.service';
import { UserStatsDto, UserStatsResponseDto } from './dto/user-stats.dto';
import { ResponseMessage } from '../../common/decorators';
import { UserManagementGuard } from '../../common/guards/user-management.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { BulkUpdateUsersDto } from './dto/bulk-update-users.dto';
import {
  CreatedUserDto,
  CreateUserResponseDto,
  BulkUpdateResponseDto,
} from './dto/create-user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(UserManagementGuard)
  @ResponseMessage('user is registered')
  @ApiOperation({ summary: 'Create a user with the initial password User@123' })
  @ApiCreatedResponse({ type: CreateUserResponseDto })
  @ApiConflictResponse({ description: 'Email already exists' })
  @ApiBadRequestResponse({ description: 'Invalid fields' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  createUser(@Body() dto: CreateUserDto): Promise<CreatedUserDto> {
    return this.usersService.createUser(dto);
  }

  @Patch('bulk')
  @UseGuards(UserManagementGuard)
  @ResponseMessage('Users updated successfully')
  @ApiOperation({
    summary: 'Change roles and/or suspend selected users atomically',
  })
  @ApiOkResponse({ type: BulkUpdateResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid IDs or no requested action' })
  @ApiNotFoundResponse({ description: 'Selected user or role not found' })
  @ApiForbiddenResponse({ description: 'Admin access required' })
  bulkUpdateUsers(@Body() dto: BulkUpdateUsersDto): Promise<void> {
    return this.usersService.bulkUpdateUsers(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Paginated user directory with search, filters and sorting',
  })
  @ApiOkResponse({ type: UserListResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid pagination, filter or sorting fields',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid or expired access token',
  })
  getUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedData<UserListItemDto>> {
    return this.usersService.getUsers(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'User totals, active users and users created this month',
    description:
      'Excludes soft-deleted users. Active means status active. Calendar month uses Asia/Kolkata.',
  })
  @ApiOkResponse({ type: UserStatsResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid or expired access token',
  })
  getStats(): Promise<UserStatsDto> {
    return this.usersService.getStats();
  }

  @Get(':id')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary:
      'User profile, two latest bookings and transactions, and latest activity logs',
  })
  @ApiOkResponse({ type: UserDetailResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid user UUID' })
  @ApiNotFoundResponse({ description: 'User not found or deleted' })
  getUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserDetailDto> {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Update personal information or suspend a user' })
  @ApiOkResponse({ type: UserPersonalInfoResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid UUID, empty body or invalid fields',
  })
  @ApiNotFoundResponse({ description: 'User not found or deleted' })
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserPersonalInfoDto> {
    return this.usersService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Soft-delete a user' })
  @ApiOkResponse({
    description: 'User soft-deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Success' },
      },
      required: ['statusCode', 'message'],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid user UUID' })
  @ApiNotFoundResponse({ description: 'User not found or already deleted' })
  @ResponseMessage('User deleted successfully')
  deleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
