import bcrypt from 'bcryptjs';
import { db } from '../_helpers/db';
import { Role } from '../_helpers/role';
import { User, UserCreationAttributes } from './user.model';

export const userService = {
  getAll,
  getById,
  create,
  update,
  delete: _delete
};

async function getAll(): Promise<User[]> {
  return await db.User.findAll();
}

async function getById(id: number): Promise<User> {
  return await getUser(id);
}

async function create(
  params: UserCreationAttributes & { password: string; confirmPassword?: string }
): Promise<void> {
  const existingUser = await db.User.findOne({ where: { email: params.email } });

  if (existingUser) {
    throw new Error(`Email "${params.email}" is already registered`);
  }

  const passwordHash = await bcrypt.hash(params.password, 10);
  const { password, confirmPassword, ...userData } = params;

  await db.User.create({
    ...userData,
    passwordHash,
    role: params.role || Role.User
  } as UserCreationAttributes);
}

async function update(
  id: number,
  params: Partial<UserCreationAttributes> & { password?: string; confirmPassword?: string }
): Promise<void> {
  const user = await getUser(id);

  if (params.password) {
    (params as Partial<UserCreationAttributes> & { passwordHash?: string }).passwordHash =
      await bcrypt.hash(params.password, 10);
  }

  delete params.password;
  delete params.confirmPassword;

  await user.update(params as UserCreationAttributes);
}

async function _delete(id: number): Promise<void> {
  const user = await getUser(id);
  await user.destroy();
}

async function getUser(id: number): Promise<User> {
  const user = await db.User.scope('withHash').findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
