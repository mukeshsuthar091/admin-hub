import { DataSource } from 'typeorm';
import { Role } from '../../modules/roles/entities/role.entity';
import { generateCode } from '../../helpers/code.helper';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);
  const roleNames = ['SUPER_ADMIN', 'ADMIN', 'VIEWER', 'EDITOR'];

  for (const name of roleNames) {
    const existingRole = await roleRepository.findOne({ where: { name } });

    if (existingRole) {
      continue;
    }

    const roleCode = await generateCode(dataSource, 'role_code_seq', 'ROL');
    const role = roleRepository.create({ name, roleCode, isDelete: false });
    await roleRepository.save(role);
  }

  console.log('Roles seeded successfully');
}
