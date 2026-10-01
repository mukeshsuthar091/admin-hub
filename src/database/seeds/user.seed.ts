import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserStatus } from '../../common/enums';
import { generateCode } from '../../helpers/code.helper';

export async function seedSuperAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const email = 'admin@adminhub.com';

  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    console.log('Super admin already exists');
    return;
  }

  const role = await roleRepository.findOne({
    where: { name: 'SUPER_ADMIN', isDelete: false },
  });

  if (!role) {
    throw new Error('SUPER_ADMIN role not found. Run role seed first.');
  }

  const password = await hash(
    'Admin@123',
    Number(process.env.SALT_ROUNDS || 10),
  );
  const userCode = await generateCode(dataSource, 'user_code_seq', 'USR');
  const user = userRepository.create({
    name: 'Super Admin',
    email,
    password,
    userCode,
    roleId: role.id,
    role,
    status: UserStatus.ACTIVE,
    isDelete: false,
  });

  await userRepository.save(user);
  console.log('Super admin created successfully');
}

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);
  const roleNames = ['ADMIN', 'VIEWER', 'EDITOR'];
  const roles: Role[] = [];

  for (const name of roleNames) {
    const role = await roleRepository.findOne({
      where: { name, isDelete: false },
    });
    if (!role) throw new Error(`${name} role not found. Run role seed first.`);
    roles.push(role);
  }

  const firstNames = [
    'Aarav',
    'Priya',
    'Rohan',
    'Ananya',
    'Vikram',
    'Neha',
    'Arjun',
    'Meera',
    'Rahul',
    'Kavya',
  ];
  const lastNames = [
    'Sharma',
    'Patel',
    'Singh',
    'Shah',
    'Verma',
    'Rao',
    'Gupta',
    'Joshi',
  ];
  const cities = [
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Delhi', state: 'Delhi' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Ahmedabad', state: 'Gujarat' },
  ];
  const statuses = [
    UserStatus.ACTIVE,
    UserStatus.ACTIVE,
    UserStatus.ACTIVE,
    UserStatus.SUSPENDED,
    UserStatus.INACTIVE,
  ];
  const password = await hash(
    'User@123',
    Number(process.env.SALT_ROUNDS || 10),
  );

  for (let i = 1; i <= 74; i++) {
    const email = `seed.user${String(i).padStart(3, '0')}@adminhub.com`;
    if (await userRepository.findOne({ where: { email } })) continue;

    const role = roles[(i - 1) % roles.length];
    const city = cities[(i - 1) % cities.length];
    const createdAt = new Date();
    createdAt.setUTCDate(createdAt.getUTCDate() - (i + 10));
    const lastActiveAt = new Date(createdAt);
    lastActiveAt.setUTCDate(lastActiveAt.getUTCDate() + 5);
    const user = userRepository.create({
      userCode: await generateCode(dataSource, 'user_code_seq', 'USR'),
      name: `${firstNames[(i - 1) % firstNames.length]} ${lastNames[Math.floor((i - 1) / firstNames.length)]}`,
      email,
      password,
      roleId: role.id,
      role,
      phoneNumber: `+919000${String(i).padStart(6, '0')}`,
      dob: `${1980 + (i % 25)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
      address: `${i}, Park Road`,
      city: city.city,
      state: city.state,
      country: 'India',
      status: statuses[(i - 1) % statuses.length],
      isDelete: false,
      createdAt,
      lastActiveAt,
    });
    await userRepository.save(user);
  }

  console.log('Users seeded successfully (75 including the initial admin)');
}
