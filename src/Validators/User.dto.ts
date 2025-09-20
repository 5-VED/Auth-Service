import { IsString, IsEmail, IsOptional, IsUUID, IsBoolean, IsArray, isString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  middleName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phoneNo!: string;

  @IsString()
  password!: string;

  @IsString()
  role!: string;

  @IsString()
  address!: string;

  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  images!: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = false;

  @IsBoolean()
  isKYCVerified?: boolean = false;

  @IsOptional()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @Type(() => Date)
  updatedAt?: Date;
}


export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}

export class ResetPasswordDto extends LoginDto {
  @IsString()
  password!: string
}

export class ForgotPasswordDto extends LoginDto {
  @IsString()
  phoneNo!: string
}

export class AddressInputDto {
  @IsString()
  line1!: string
  
  @IsString()
  line2!: string

  @IsString()
  city!: string

  @IsString()
  state!: string

  @IsString()
  country!: string
}

export class SignupDto {
  @IsString()
  firstName!: string

  @IsString()
  lastName!: string

  @IsString()
  @IsOptional()
  middleName!: string

  @IsEmail()
  email!: string

  @IsString()
  phoneNo!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsString()
  @IsOptional()
  role!: string


  @ValidateNested()
  @IsOptional()
  @Type(() => AddressInputDto)
  address?: AddressInputDto | string

  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @IsOptional()
  images?: string[]
}




