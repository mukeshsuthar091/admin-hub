import { DataSource } from 'typeorm';

type CodeSequence =
  | 'user_code_seq'
  | 'role_code_seq'
  | 'booking_code_seq'
  | 'transaction_code_seq';

export async function generateCode(
  dataSource: DataSource,
  sequenceName: CodeSequence,
  prefix: string,
): Promise<string> {
  const result = await dataSource.query<{ value: string }[]>(
    'SELECT nextval($1::regclass) AS value',
    [sequenceName],
  );

  return `${prefix}-${result[0].value.toString().padStart(4, '0')}`;
}
