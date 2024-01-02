import { IsOptional } from 'class-validator';

export class QueryUsersDto {
  @IsOptional()
  public username: string;

  @IsOptional()
  public mail: string;
}
