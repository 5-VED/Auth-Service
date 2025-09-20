import { IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RoleDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  role!: string;
}
